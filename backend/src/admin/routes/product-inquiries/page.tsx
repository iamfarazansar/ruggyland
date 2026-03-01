import { defineRouteConfig } from "@medusajs/admin-sdk"
import { InformationCircle } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  Badge,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"

type Inquiry = {
  id: string
  product_title: string
  product_handle?: string
  name: string
  email: string
  phone?: string
  message: string
  status: string
  created_at?: string
}

type Response = {
  inquiries: Inquiry[]
  count: number
  limit?: number
  offset?: number
}

const columnHelper = createDataTableColumnHelper<Inquiry>()

const columns = [
  columnHelper.accessor("created_at", {
    header: "Date",
    cell: ({ getValue }) => {
      const v = getValue()
      return v ? new Date(v).toLocaleString() : "—"
    },
  }),
  columnHelper.accessor("product_title", {
    header: "Product",
    cell: ({ getValue, row }) => (
      <div className="flex flex-col">
        <Text size="small" leading="compact" weight="plus">
          {getValue()}
        </Text>
        {row.original.product_handle && (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            /{row.original.product_handle}
          </Text>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => (
      <a
        href={`mailto:${getValue()}`}
        className="text-ui-fg-interactive hover:underline"
      >
        {getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: ({ getValue }) => (
      <Text
        size="small"
        leading="compact"
        className="max-w-[280px] truncate text-ui-fg-subtle"
        title={getValue()}
      >
        {getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const v = getValue()
      return (
        <Badge color={v === "new" ? "blue" : "green"} size="2xsmall">
          {v}
        </Badge>
      )
    },
  }),
]

export default function ProductInquiriesPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [searchValue, setSearchValue] = useState("")

  const offset = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination]
  )

  const { data, isLoading } = useQuery<Response>({
    queryKey: ["product-inquiries", pagination.pageIndex, pagination.pageSize],
    queryFn: async () =>
      (await sdk.client.fetch(
        `/admin/product-inquiries?limit=${pagination.pageSize}&offset=${offset}`,
        { method: "GET" }
      )) as Response,
  })

  const filtered = useMemo(() => {
    const rows = data?.inquiries ?? []
    if (!searchValue) return rows
    const q = searchValue.toLowerCase()
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.product_title.toLowerCase().includes(q)
    )
  }, [data?.inquiries, searchValue])

  const table = useDataTable({
    columns,
    data: filtered,
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: searchValue,
      onSearchChange: setSearchValue,
    },
  })

  return (
    <Container>
      <Heading className="mb-4">Product Inquiries</Heading>
      <DataTable instance={table}>
        <DataTable.Toolbar>
          <DataTable.Search placeholder="Search by name, email, product..." />
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Product Inquiries",
  icon: InformationCircle,
})
