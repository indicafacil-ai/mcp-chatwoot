import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, boardId: number) =>
    `/api/v1/accounts/${accountId}/kanban/boards/${boardId}/products`;

  server.registerTool(
    "kanban_products_list",
    {
      title: "List Funnel Products",
      description:
        "[apps-id.indicafacil.app] The product catalog of one funnel. Products are per funnel, not per account: a card can only carry products from its own board.",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id, ...params }) => {
      const result = await client.get(base(account_id, board_id), params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_products_get",
    {
      title: "Get Funnel Product",
      description: "[apps-id.indicafacil.app] Read one product of a funnel",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        product_id: z.number().describe("Product ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, board_id, product_id }) => {
      const result = await client.get(
        `${base(account_id, board_id)}/${product_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_products_create",
    {
      title: "Create Funnel Product",
      description:
        "[apps-id.indicafacil.app] Add a product to a funnel's catalog",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        name: z.string().describe("Product name"),
        unit_price: z.number().optional().describe("Unit price"),
        description: z.string().optional().describe("Product description"),
        category: z
          .string()
          .optional()
          .describe("Category, for grouping in the catalog"),
        archived: z
          .boolean()
          .optional()
          .describe(
            "Archived products stay on existing cards but cannot be added to new ones",
          ),
      },
    },
    async ({ account_id, board_id, ...product }) => {
      const result = await client.post(base(account_id, board_id), { product });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_products_update",
    {
      title: "Update Funnel Product",
      description: "[apps-id.indicafacil.app] Update a product of a funnel",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        product_id: z.number().describe("Product ID"),
        name: z.string().optional().describe("Product name"),
        unit_price: z.number().optional().describe("Unit price"),
        description: z.string().optional().describe("Product description"),
        category: z.string().optional().describe("Category"),
        archived: z.boolean().optional().describe("Archive or unarchive"),
      },
    },
    async ({ account_id, board_id, product_id, ...product }) => {
      const result = await client.patch(
        `${base(account_id, board_id)}/${product_id}`,
        { product },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_products_delete",
    {
      title: "Delete Funnel Product",
      description:
        "[apps-id.indicafacil.app] Delete a product from a funnel's catalog. Prefer archiving when the product already sits on cards.",
      inputSchema: {
        account_id: accountId,
        board_id: z.number().describe("Kanban board ID"),
        product_id: z.number().describe("Product ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, board_id, product_id }) => {
      const result = await client.delete(
        `${base(account_id, board_id)}/${product_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
