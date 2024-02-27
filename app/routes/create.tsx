import { ClientActionFunctionArgs, Form, redirect } from "@remix-run/react";
import { putAssistant, updateAssistantWithFormData } from "~/assistants";
import { AssistantDocument } from "~/db/schema";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";
import { generateId } from "~/utils/generateId";
import { PageBuilder } from "~/utils/UiBuilder";

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = generateId();

  const assistant: AssistantDocument = AssistantDocument.parse({
    id,
    name: "Untitled assistant",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  updateAssistantWithFormData(assistant, formData);
  await putAssistant(assistant);
  enqueueSnackbar("Assistant created", { variant: "success" });

  return redirect(`/assistants/${id}`);
};

export default function CreatePage() {
  const builder = new PageBuilder("Create a new assistant");
  buildAssistantForm(builder);
  return <Form method="POST">{builder.build()}</Form>;
}

export function buildAssistantForm(
  builder: PageBuilder,
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
