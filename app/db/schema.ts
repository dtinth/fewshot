import { z } from "zod";

export const IndexDocument = z
  .object({
    assistants: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .default([]),
  })
  .default({});

export type IndexDocument = z.infer<typeof IndexDocument>;

export const DataPrompt = z.object({
  preamble: z.string().default(""),
  columns: z
    .array(
      z.object({
        columnId: z.string(),
        displayName: z.string(),
        isInput: z.boolean().optional(),
      })
    )
    .default([
      {
        columnId: "E4BC7934-4064-4208-9C86-E95405BA17AB",
        displayName: "input:",
        isInput: true,
      },
      {
        columnId: "E4BC7934-4064-4208-9C86-E95405BA17AC",
        displayName: "output:",
      },
    ]),
  rows: z
    .array(
      z.object({
        columnBindings: z.record(z.string()),
        rowId: z.string(),
      })
    )
    .default([]),
  rowsUsed: z.array(z.string()).default([]),
});

export type DataPrompt = z.infer<typeof DataPrompt>;

export const AssistantDocument = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dataPrompt: DataPrompt.default({}),
});

export type AssistantDocument = z.infer<typeof AssistantDocument>;
