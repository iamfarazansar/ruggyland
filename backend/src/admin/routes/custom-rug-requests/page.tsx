import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  Container,
  Heading,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  width: number;
  height: number;
  unit: string;
  shape: string;
  status: string;
  referenceImages?: string[];
  created_at?: string;
};

type AdminCustomRugRequestsResponse = {
  requests: Row[];
  count: number;
  limit?: number;
  offset?: number;
};

const columnHelper = createDataTableColumnHelper<Row>();

const columns = [
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: ({ getValue }) => {
      const v = getValue();
      return v ? new Date(v).toLocaleString() : "—";
    },
  }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("shape", { header: "Shape" }),
  columnHelper.accessor("unit", { header: "Unit" }),
  columnHelper.accessor("width", { header: "W" }),
  columnHelper.accessor("height", { header: "H" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("referenceImages", {
    header: "Images",
    cell: ({ getValue }) => {
      const imgs = getValue() || [];
      if (!imgs.length) return "—";

      return (
        <div className="flex flex-wrap gap-2">
          {imgs.map((src: string, i: number) => (
            <a
              key={src + i}
              href={src}
              target="_blank"
              rel="noreferrer"
              title="Open image"
              className="block"
            >
              <img
                src={src}
                alt={`ref-${i}`}
                className="h-10 w-10 rounded-md border object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      );
    },
  }),
];

export default function CustomRugRequestsPage() {
  // ✅ Medusa UI expects pagination state object
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const offset = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination]
  );

  const { data, isLoading } = useQuery<AdminCustomRugRequestsResponse>({
    queryKey: [
      "custom-rug-requests",
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: async () => {
      return (await sdk.client.fetch(
        `/admin/custom-rug-requests?limit=${pagination.pageSize}&offset=${offset}`,
        { method: "GET" }
      )) as AdminCustomRugRequestsResponse;
    },
  });

  const table = useDataTable({
    columns,
    data: data?.requests ?? [],
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,

    // ✅ correct pagination signature for @medusajs/ui
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  return (
    <Container>
      <Heading className="mb-4">Custom Rug Requests</Heading>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Custom Rug Requests",
  icon: ChatBubbleLeftRight,
});
