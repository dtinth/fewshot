import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import {
  getAssistant,
  putAssistant,
  updateAssistantWithFormData,
} from "~/assistants";
import { PageBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";
import { buildAssistantForm } from "./create";

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

export default function AssistantPage() {
  const { assistant } = useLoaderData<typeof clientLoader>();

  const builder = new PageBuilder(`Edit assistant`);
  buildAssistantForm(builder, assistant);

  return <Form method="POST">{builder.build()}</Form>;
}
