import { z } from "zod";
import type { RegisterFn } from "@/types.ts";

const accountId = z.number().describe("The account ID");

// Every report takes the same filter set. board_id is optional on purpose: leaving it out means
// "all my funnels" instead of forcing a second call per board.
const filtros = {
  since: z.string().optional().describe("Start of the window, ISO 8601"),
  until: z.string().optional().describe("End of the window, ISO 8601"),
  board_id: z
    .number()
    .optional()
    .describe(
      "Restrict to one funnel. Omit for every funnel the caller can see",
    ),
  agent_id: z.number().optional().describe("Restrict to one agent"),
  inbox_id: z.number().optional().describe("Restrict to one inbox"),
};

export const register: RegisterFn = (server, client) => {
  const base = (id: number) => `/api/v1/accounts/${id}/kanban/reports`;

  const relatorio = (
    nome: string,
    titulo: string,
    descricao: string,
    extra: Record<string, z.ZodTypeAny> = {},
  ) => {
    server.registerTool(
      nome,
      {
        title: titulo,
        description: `[apps-id.indicafacil.app] ${descricao}`,
        inputSchema: { account_id: accountId, ...filtros, ...extra },
        annotations: { readOnlyHint: true },
      },
      async ({ account_id, ...params }) => {
        const result = await client.get(
          `${base(account_id)}/${nome.replace("kanban_reports_", "")}`,
          params,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      },
    );
  };

  relatorio(
    "kanban_reports_summary",
    "Funnel Summary",
    "Headline numbers of the funnel: cards, value, won and lost in the window",
  );

  relatorio(
    "kanban_reports_funnel",
    "Funnel Conversion",
    "How many cards reached each step, and where they dropped off",
  );

  relatorio(
    "kanban_reports_stage_durations",
    "Time per Step",
    "How long cards sit in each step. Finds the step that is holding the funnel back",
  );

  relatorio(
    "kanban_reports_agent_performance",
    "Agent Performance",
    "Cards, value and outcomes per agent in the window",
  );

  relatorio(
    "kanban_reports_cfd",
    "Cumulative Flow",
    "Cumulative flow diagram. Reads the DAILY PHOTOGRAPHS, not the transition ledger, so it shows the board as it looked each day",
  );

  relatorio(
    "kanban_reports_aging",
    "Card Aging",
    "How old the cards currently on the board are. Reads the LIVE board, not history: it answers what is stuck right now",
  );

  relatorio(
    "kanban_reports_timeseries",
    "Time Series",
    "One metric over time, for charting",
    {
      metric: z.string().optional().describe("Which metric to plot over time"),
      group_by: z.string().optional().describe("Bucket size, e.g. day or week"),
      page: z.number().optional().describe("Page number"),
    },
  );
};
