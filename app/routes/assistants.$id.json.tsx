import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { getAssistant, putAssistant } from "~/assistants";
import { AssistantDocument } from "~/db/schema";
import { PageBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const id = args.params.id;
  const assistant = await getAssistant(id);
  return { id, assistant };
};

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = String(args.params.id);
  await getAssistant(id);
  const assistant = AssistantDocument.parse(
    JSON.parse(String(formData.get("json")))
  );
  assistant.id = id;
  await putAssistant(assistant);
  enqueueSnackbar("Assistant updated", { variant: "success" });
  return redirect(`/assistants/${id}`);
};

export default function AssistantJsonPage() {
  const { assistant } = useLoaderData<typeof clientLoader>();

  const builder = new PageBuilder(`Edit assistant`);
  builder.textField({
    label: "JSON",
    name: "json",
    required: true,
    large: true,
    multiline: true,
    defaultValue: JSON.stringify(assistant, null, 2),
    monospace: true,
  });
  builder
    .buttonBar()
    .addButton({ label: "Save", type: "submit", variant: "contained" });

  return <Form method="POST">{builder.build()}</Form>;
}
