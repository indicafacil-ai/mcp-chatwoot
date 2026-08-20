import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

export const register: RegisterFn = (server, client) => {
  const base = (accountId: number, taskId: number) =>
    `/api/v1/accounts/${accountId}/kanban/tasks/${taskId}/comments`;

  server.registerTool(
    "kanban_task_comments_list",
    {
      title: "List Card Comments",
      description:
        "[indicafacil.ai] Notes on a card, written by people or by AI agents. Internal: the customer never sees them.",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        page: z.number().optional().describe("Page number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, task_id, ...params }) => {
      const result = await client.get(base(account_id, task_id), params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_comments_create",
    {
      title: "Add Card Comment",
      description:
        "[indicafacil.ai] Write a note on a card. author_type accepts 'user' or 'ai' only: 'system' is reserved for the platform itself and is rejected.",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        content: z.string().describe("The note text"),
        author_type: z
          .enum(["user", "ai"])
          .optional()
          .describe(
            "Who is writing. 'system' is reserved and cannot be set by a caller",
          ),
        author_label: z
          .string()
          .optional()
          .describe("Display name of the author, e.g. the agent's name"),
      },
    },
    async ({ account_id, task_id, ...comment }) => {
      const result = await client.post(base(account_id, task_id), { comment });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_comments_update",
    {
      title: "Update Card Comment",
      description: "[indicafacil.ai] Edit the text of a card note",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        comment_id: z.number().describe("Comment ID"),
        content: z.string().describe("The new note text"),
      },
    },
    async ({ account_id, task_id, comment_id, content }) => {
      const result = await client.patch(
        `${base(account_id, task_id)}/${comment_id}`,
        { comment: { content } },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "kanban_task_comments_delete",
    {
      title: "Delete Card Comment",
      description: "[indicafacil.ai] Delete a note from a card",
      inputSchema: {
        account_id: accountId,
        task_id: z.number().describe("Kanban task (card) ID"),
        comment_id: z.number().describe("Comment ID"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ account_id, task_id, comment_id }) => {
      const result = await client.delete(
        `${base(account_id, task_id)}/${comment_id}`,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
