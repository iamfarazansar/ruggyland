import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
import {
  Container,
  Heading,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  Badge,
  Button,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";
import { useState } from "react";

type StoryStep = {
  title: string;
  description: string;
  image_url: string;
};

type Row = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  thumbnail?: string;
  size?: string;
  material?: string;
  published: boolean;
  steps: StoryStep[];
  created_at?: string;
};

type AdminRugStoriesResponse = {
  stories: Row[];
  count: number;
};

const columnHelper = createDataTableColumnHelper<Row>();

const columns = [
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
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("size", { header: "Size" }),
  columnHelper.accessor("material", { header: "Material" }),
  columnHelper.accessor("steps", {
    header: "Steps",
    cell: ({ getValue }) => {
      const steps = getValue() || [];
      return steps.length;
    },
  }),
  columnHelper.accessor("published", {
    header: "Status",
    cell: ({ getValue }) => {
      const published = getValue();
      return (
        <Badge color={published ? "green" : "grey"}>
          {published ? "Published" : "Draft"}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "",
    cell: ({ getValue }) => {
      const id = getValue();
      return (
        <a href={`/app/rug-stories/${id}`}>
          <Button variant="secondary" size="small">
            Edit
          </Button>
        </a>
      );
    },
  }),
];

export default function RugStoriesPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const { data, isLoading } = useQuery<AdminRugStoriesResponse>({
    queryKey: ["rug-stories", pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      return (await sdk.client.fetch(`/admin/rug-stories`, {
        method: "GET",
      })) as AdminRugStoriesResponse;
    },
  });

  const table = useDataTable({
    columns,
    data: data?.stories ?? [],
    getRowId: (row) => row.id,
    rowCount: data?.count ?? 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Heading>Rug Stories</Heading>
        <a href="/app/rug-stories/create">
          <Button>Create Story</Button>
        </a>
      </div>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Rug Stories",
  icon: Photo,
});
