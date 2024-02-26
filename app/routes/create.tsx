import { ClientActionFunctionArgs, Form, redirect } from "@remix-run/react";
import { get, set } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { AssistantDocument, IndexDocument } from "~/db/schema";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";
import { generateId } from "~/utils/generateId";
import { UiBuilder } from "~/utils/UiBuilder";

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = generateId();

  const assistant: AssistantDocument = AssistantDocument.parse({
    id,
    name: "Untitled assistant",
    createdAt: new Date().toISOString(),
  });
  updateAssistantWithFormData(assistant, formData);
  await putAssistant(assistant);
  enqueueSnackbar("Assistant created", { variant: "success" });

  return redirect(`/assistants/${id}`);
};

export default function CreatePage() {
  const builder = new UiBuilder("Create a new assistant");
  buildAssistantForm(builder);
  return <Form method="POST">{builder.build()}</Form>;
}

export function buildAssistantForm(
  builder: UiBuilder,
  existing?: AssistantDocument
) {
  builder.say("Give your assistant a name.");
  builder.textField({
    label: "Assistant name",
    name: "name",
    required: true,
    defaultValue: existing?.name,
  });

  builder.say("Give it a system prompt to guide the model’s behavior.");
  builder.textField({
    label: "System prompt",
    name: "preamble",
    defaultValue: existing?.dataPrompt.preamble,
    multiline: true,
    large: true,
  });

  builder.submitButton({ label: existing ? "Save" : "Create assistant" });
}

export function updateAssistantWithFormData(
  assistant: AssistantDocument,
  formData: FormData
) {
  assistant.name = formData.get("name") as string;
  assistant.dataPrompt.preamble = formData.get("preamble") as string;
  assistant.updatedAt = new Date().toISOString();
}

export async function putAssistant(assistant: AssistantDocument) {
  const index = IndexDocument.parse(await get("index", getStore()));
  index.assistants = [
    { id: assistant.id, name: assistant.name },
    ...index.assistants.filter((a) => a.id !== assistant.id),
  ];
  set(`assistant:${assistant.id}`, assistant, getStore());
  set("index", index, getStore());
}
