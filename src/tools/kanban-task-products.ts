import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, taskId: number) =>
    `/api/v1/accounts/${accountId}/kanban/tasks/${taskId}/products`;

  server.registerTool(
    "kanban_task_products_list",
    {
      title: "List Card Products",
      description:
        "[indicafacil.ai] Products attached to one card, with quantity, unit price and discount. This is what gives the card its value.",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, task_id }) => {
      const result = await client.get(base(account_id, task_id));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_products_create",
    {
      title: "Add Product to Card",
      description:
        "[indicafacil.ai] Attach a product to a card. The product must belong to the SAME funnel as the card.",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        product_id: z
          .number()
          .describe("Product ID, from the card's own funnel"),
        quantity: z.number().optional().describe("Quantity"),
        unit_price: z
          .number()
          .optional()
          .describe("Overrides the catalog price for this card only"),
        discount_percentage: z
          .number()
          .optional()
          .describe("Discount, in percent"),
      },
    },
    async ({ account_id, task_id, ...task_product }) => {
      const result = await client.post(base(account_id, task_id), {
        task_product,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_products_update",
    {
      title: "Update Card Product",
      description:
        "[indicafacil.ai] Change quantity, price or discount of a product already on a card",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        task_product_id: z.number().describe("Card-product line ID"),
        quantity: z.number().optional().describe("Quantity"),
        unit_price: z.number().optional().describe("Unit price for this card"),
        discount_percentage: z
          .number()
          .optional()
          .describe("Discount, in percent"),
      },
    },
    async ({ account_id, task_id, task_product_id, ...task_product }) => {
      const result = await client.patch(
        `${base(account_id, task_id)}/${task_product_id}`,
        { task_product },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_products_delete",
    {
      title: "Remove Product from Card",
      description: "[indicafacil.ai] Detach a product line from a card",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        task_product_id: z.number().describe("Card-product line ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, task_id, task_product_id }) => {
      const result = await client.delete(
        `${base(account_id, task_id)}/${task_product_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
