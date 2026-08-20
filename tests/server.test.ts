import { describe, expect, test } from "bun:test";
import { ChatwootClient } from "@/client.ts";
import { createServer } from "@/server.ts";

describe("Server", () => {
  test("creates server with all tools registered", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // The server should have been created successfully
    expect(server).toBeDefined();
  });

  test("registers all 147 tools", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // biome-ignore lint/suspicious/noExplicitAny: accessing internal properties for testing
    const tools = (server as any)._registeredTools;
    expect(Object.keys(tools).length).toBe(147);
  });

  test("has apps-id.indicafacil.app exclusive tools", () => {
    const client = new ChatwootClient(
      "https://chatwoot.example.com",
      "test-token",
    );
    const server = createServer(client);

    // biome-ignore lint/suspicious/noExplicitAny: accessing internal properties for testing
    const tools = (server as any)._registeredTools;

    // Kanban tools
    expect(tools.kanban_boards_list).toBeDefined();
    // Our own Kanban surface, absent from the upstream fork: binding inboxes to a funnel (without
    // which no card is ever created), reordering steps, the product catalog and the reports.
    expect(tools.kanban_boards_update_inboxes).toBeDefined();
    expect(tools.kanban_boards_conversations).toBeDefined();
    expect(tools.kanban_steps_reorder).toBeDefined();
    expect(tools.kanban_products_list).toBeDefined();
    expect(tools.kanban_task_products_create).toBeDefined();
    expect(tools.kanban_task_comments_create).toBeDefined();
    expect(tools.kanban_reports_funnel).toBeDefined();
    expect(tools.kanban_reports_aging).toBeDefined();
    expect(tools.kanban_steps_list).toBeDefined();
    expect(tools.kanban_tasks_list).toBeDefined();
    expect(tools.kanban_audit_events_list).toBeDefined();

    // Scheduled messages
    expect(tools.scheduled_messages_list).toBeDefined();
  });
});
