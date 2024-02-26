import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { get } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { AssistantDocument } from "~/db/schema";
import { UiBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";
import {
  buildAssistantForm,
  putAssistant,
  updateAssistantWithFormData,
} from "./create";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const id = args.params.id;
  const assistant = await getAssistant(id);
  return { id, assistant };
};

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = args.params.id;
  const assistant = await getAssistant(id);
  updateAssistantWithFormData(assistant, formData);
  await putAssistant(assistant);
  enqueueSnackbar("Assistant updated", { variant: "success" });
  return redirect(`/assistants/${id}`);
};

async function getAssistant(id: string | undefined) {
  return AssistantDocument.parse(await get(`assistant:${id}`, getStore()));
}

export default function AssistantPage() {
  const { assistant } = useLoaderData<typeof clientLoader>();

  const builder = new UiBuilder(`Edit assistant`);
  buildAssistantForm(builder, assistant);

  return <Form method="POST">{builder.build()}</Form>;
}
