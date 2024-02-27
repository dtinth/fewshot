import { ClientLoaderFunctionArgs, redirect } from "@remix-run/react";
import { generateId } from "~/utils/generateId";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const id = args.params.id;
  return redirect(`/assistants/${id}/examples/${generateId()}`);
};
