import { Button } from "@mui/material";
import { ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import { get } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { AssistantDocument } from "~/db/schema";
import { UiBuilder } from "~/utils/UiBuilder";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const id = args.params.id;
  const assistant = AssistantDocument.parse(
    await get(`assistant:${id}`, getStore())
  );
  return { id, assistant };
};

export default function AssistantPage() {
  const { id, assistant } = useLoaderData<typeof clientLoader>();
  const builder = new UiBuilder(`Assistant: ${assistant.name}`);
  builder.add(
    <Button variant="outlined" href={`/assistants/${id}/edit`}>
      Edit assistant
    </Button>
  );
  return builder.build();
}
