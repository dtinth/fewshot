import { get, set } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { AssistantDocument, IndexDocument } from "~/db/schema";

export async function getAssistant(id: string | undefined) {
  return AssistantDocument.parse(await get(`assistant:${id}`, getStore()));
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
