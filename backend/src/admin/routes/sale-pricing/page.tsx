import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CurrencyDollar } from "@medusajs/icons";
import {
  Container,
  Heading,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  Badge,
  Button,
  Input,
  Label,
  Text,
  toast,
  Checkbox,
} from "@medusajs/ui";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";

// --- Types ---
type VariantPrice = {
  id: string;
  amount: number;
  currency_code: string;
};

type Variant = {
  id: string;
  title: string;
  sku: string | null;
  prices: VariantPrice[];
};

type Product = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  status: string;
  variants: Variant[];
};

type ProductsResponse = {
  products: Product[];
  count: number;
};

type ApplySaleResponse = {
  success: boolean;
  message: string;
  discount_percentage: number;
  inflate_base_prices: boolean;
  variants_updated: number;
  price_list: { id: string; title: string } | null;
};

type PriceList = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  metadata?: {
    is_inflated?: boolean;
    discount_percentage?: number;
  };
};

// --- Row type for DataTable ---
type Row = {
  id: string;
  title: string;
  thumbnail: string | null;
  variant_count: number;
  starting_price: string;
};

// --- Column definitions ---
const columnHelper = createDataTableColumnHelper<Row>();

const columns = [
  columnHelper.select(),
  columnHelper.accessor("thumbnail", {
    header: "",
    cell: ({ getValue }) => {
      const url = getValue();
      return url ? (
        <img
          src={url}
          alt=""
          style={{
            height: 40,
            width: 40,
            borderRadius: 6,
            objectFit: "cover",
            border: "1px solid #eee",
          }}
        />
      ) : (
        <div
          style={{
            height: 40,
            width: 40,
            borderRadius: 6,
            border: "1px solid #eee",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          —
        </div>
      );
    },
  }),
  columnHelper.accessor("title", { header: "Product" }),
  columnHelper.accessor("variant_count", {
    header: "Variants",
    cell: ({ getValue }) => <Badge color="grey">{getValue()}</Badge>,
  }),
  columnHelper.accessor("starting_price", { header: "Starting Price" }),
];

// --- Helper: get lowest price from a product ---
function getStartingPrice(product: Product): string {
  let lowest: number | null = null;
  let currency = "";

  for (const variant of product.variants || []) {
    for (const price of variant.prices || []) {
      if (lowest === null || price.amount < lowest) {
        lowest = price.amount;
        currency = price.currency_code;
      }
    }
  }

  if (lowest === null) return "No price";
  return `${currency.toUpperCase()} ${lowest.toLocaleString()}`;
}

// --- Page Component ---
export default function SalePricingPage() {
  const [discountInput, setDiscountInput] = useState("20");
  const [inflateBasePrices, setInflateBasePrices] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const discount = parseFloat(discountInput);
  const isValidDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  // Fetch products
  const { data, isLoading, refetch } = useQuery<ProductsResponse>({
    queryKey: ["sale-pricing-products"],
    queryFn: async () => {
      return (await sdk.client.fetch("/admin/sale-pricing/products", {
        method: "GET",
      })) as ProductsResponse;
    },
  });

  // Fetch all price lists with metadata
  const { data: priceListsData, refetch: refetchPriceLists } = useQuery<{
    price_lists: PriceList[];
  }>({
    queryKey: ["sale-price-lists"],
    queryFn: async () => {
      return (await sdk.client.fetch("/admin/sale-pricing/price-lists", {
        method: "GET",
      })) as any;
    },
  });

  // Transform to table rows
  const rows: Row[] = useMemo(() => {
    return (data?.products || []).map((product) => ({
      id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      variant_count: product.variants?.length || 0,
      starting_price: getStartingPrice(product),
    }));
  }, [data]);

  // Apply sale mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      const selectedIds = Object.keys(rowSelection).filter(
        (key) => rowSelection[key],
      );
      return (await sdk.client.fetch("/admin/sale-pricing/apply", {
        method: "POST",
        body: {
          product_ids: selectedIds,
          discount_percentage: discount,
          inflate_base_prices: inflateBasePrices,
        },
      })) as ApplySaleResponse;
    },
    onSuccess: (result) => {
      toast.success("Sale pricing applied", {
        description: result.message,
      });
      setRowSelection({});
      refetch();
      refetchPriceLists();
    },
    onError: (error: any) => {
      toast.error("Failed to apply sale", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  // Reset sale mutation
  const resetMutation = useMutation({
    mutationFn: async (priceListId: string) => {
      return (await sdk.client.fetch("/admin/sale-pricing/reset", {
        method: "POST",
        body: {
          price_list_id: priceListId,
        },
      })) as { success: boolean; message: string; was_inflated: boolean };
    },
    onSuccess: (result) => {
      toast.success("Prices reset", {
        description: result.message,
      });
      refetch();
      refetchPriceLists();
    },
    onError: (error: any) => {
      toast.error("Failed to reset prices", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  const table = useDataTable({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
    },
  });

  // Filter for sale-type price lists
  const activePriceLists = (priceListsData?.price_lists || []).filter(
    (pl) => pl.type === "sale" && pl.status === "active",
  );

  return (
    <Container>
      <div style={{ marginBottom: 24 }}>
        <Heading>Sale Pricing</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle mt-2">
          Select products and set a discount percentage. Choose whether to
          inflate base prices or just create a sale price list.
        </Text>
      </div>

      {/* Active Sale Price Lists - Always show section */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 8,
          border: "1px solid var(--border-base)",
          background: "var(--bg-subtle)",
        }}
      >
        <Text size="small" weight="plus" className="mb-3">
          Active Sale Price Lists
        </Text>
        {activePriceLists.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">
            No active sales. Apply a sale to products below to create one.
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activePriceLists.map((pl) => {
              const isInflated = pl.metadata?.is_inflated === true;
              const discountPct = pl.metadata?.discount_percentage;

              return (
                <div
                  key={pl.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-base)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text size="small" weight="plus">
                          {pl.title}
                        </Text>
                        {isInflated ? (
                          <Badge color="orange" size="2xsmall">
                            Inflated
                          </Badge>
                        ) : (
                          <Badge color="blue" size="2xsmall">
                            Standard
                          </Badge>
                        )}
                        {discountPct && (
                          <Badge color="green" size="2xsmall">
                            {discountPct}% OFF
                          </Badge>
                        )}
                      </div>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        Created:{" "}
                        {new Date(pl.created_at).toLocaleDateString("en-IN")}
                        {isInflated &&
                          " • Will restore original prices on reset"}
                      </Text>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => {
                      const action = isInflated
                        ? `restore original prices and delete`
                        : `delete`;
                      if (
                        confirm(
                          `${action.charAt(0).toUpperCase() + action.slice(1)} "${pl.title}"?`,
                        )
                      ) {
                        resetMutation.mutate(pl.id);
                      }
                    }}
                    isLoading={resetMutation.isPending}
                  >
                    {isInflated ? "Reset Prices" : "Delete Sale"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 8,
          border: "1px solid var(--border-base)",
          background: "var(--bg-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ width: 180 }}>
            <Label htmlFor="discount" size="small" weight="plus">
              Discount %
            </Label>
            <Input
              id="discount"
              type="number"
              min={1}
              max={99}
              step={1}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="e.g. 20"
              size="small"
            />
          </div>

          <div style={{ flex: 1 }}>
            {isValidDiscount && (
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                {inflateBasePrices
                  ? `Example: ₹180 → MRP ₹${Math.round(180 / (1 - discount / 100))}, Sale ₹180 (${discount}% OFF)`
                  : `Example: ₹180 → Sale ₹${Math.round(180 * (1 - discount / 100))} (${discount}% OFF)`}
              </Text>
            )}
          </div>

          <Button
            size="small"
            onClick={() => applyMutation.mutate()}
            isLoading={applyMutation.isPending}
            disabled={
              selectedCount === 0 || !isValidDiscount || applyMutation.isPending
            }
          >
            Apply Sale to {selectedCount} Product
            {selectedCount !== 1 ? "s" : ""}
          </Button>
        </div>

        {/* Inflate checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Checkbox
            id="inflate"
            checked={inflateBasePrices}
            onCheckedChange={(checked) =>
              setInflateBasePrices(checked === true)
            }
          />
          <Label htmlFor="inflate" size="small" className="cursor-pointer">
            Inflate base prices (show original price as MRP with strikethrough)
          </Label>
        </div>
      </div>

      {/* Warning */}
      {selectedCount > 0 && inflateBasePrices && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 16px",
            borderRadius: 8,
            background: "var(--tag-orange-bg)",
            border: "1px solid var(--tag-orange-border)",
          }}
        >
          <Text size="small" leading="compact" className="text-ui-fg-on-color">
            Warning: This will permanently modify base prices. Do not run twice
            on the same products without resetting first.
          </Text>
        </div>
      )}

      {/* DataTable with checkboxes */}
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Sale Pricing",
  icon: CurrencyDollar,
});
