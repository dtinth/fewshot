import { TextField } from "@mui/material";
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { addAsExampleMap, getAssistant, putAssistant } from "~/assistants";
import { AssistantDocument } from "~/db/schema";
import { PageBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";

type Row = AssistantDocument["dataPrompt"]["rows"][number];

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const assistantId = args.params.id;
  const assistant = await getAssistant(assistantId);
  const exampleId = String(args.params.exampleId);
  const rows = assistant.dataPrompt.rows;
  const index = rows.findIndex((r) => r.rowId === exampleId);

  const example = rows[index] as Row | undefined;
  return { assistant, example, index, exampleId };
};

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = args.params.id;
  const exampleId = args.params.exampleId;
  if (!exampleId) {
    throw new Response("No example", { status: 400 });
  }
  const assistant = await getAssistant(id);
  const rows = assistant.dataPrompt.rows;
  const index = rows.findIndex((r) => r.rowId === exampleId);
  const newRow: Row = { rowId: exampleId, columnBindings: {} };
  for (const column of assistant.dataPrompt.columns) {
    newRow.columnBindings[column.columnId] = String(
      formData.get(`columnBindings.${column.columnId}`) || ""
    );
  }
  if (index !== -1) {
    rows[index] = newRow;
  } else {
    rows.push(newRow);
  }
  await putAssistant(assistant);
  enqueueSnackbar(index === -1 ? "Example added" : "Example updated", {
    variant: "success",
  });
  return redirect(`/assistants/${id}`);
};

const deleteExample = async (assistantId: string, exampleId: string) => {
  const assistant = await getAssistant(assistantId);
  const index = assistant.dataPrompt.rows.findIndex(
    (r) => r.rowId === exampleId
  );
  if (index > -1) {
    assistant.dataPrompt.rows.splice(index, 1);
    await putAssistant(assistant);
  }
};

export default function AssistantExamplePage() {
  const { assistant, index, example, exampleId } =
    useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  const builder = new PageBuilder(
    index === -1 ? "Add new example" : `Edit example #${index + 1}`
  );
  for (const column of assistant.dataPrompt.columns) {
    builder.add(
      <TextField
        multiline
        fullWidth
        label={column.displayName}
        color={column.isInput ? "primary" : "secondary"}
        defaultValue={
          example?.columnBindings?.[column.columnId] ??
          addAsExampleMap.get(exampleId)?.get(column.columnId) ??
          ""
        }
        name={`columnBindings.${column.columnId}`}
      />
    );
  }
  builder
    .buttonBarBuilder()
    .submitButton({ label: "Save example" })
    .button({
      label: "Cancel",
      href: `/assistants/${assistant.id}`,
      variant: "outlined",
    })
    .button({
      label: "Delete",
      variant: "outlined",
      color: "error",
      onClick: async () => {
        if (!confirm("Are you sure you want to delete this example?")) {
          return;
        }
        await deleteExample(assistant.id, exampleId);
        navigate(`/assistants/${assistant.id}`, { replace: true });
      },
    });

  return <Form method="POST">{builder.build()}</Form>;
}
