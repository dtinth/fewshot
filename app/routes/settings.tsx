import { Link } from "@mui/material";
import {
  ClientActionFunctionArgs,
  Form,
  useLoaderData,
} from "@remix-run/react";
import { getApiKey, setApiKey } from "~/inference";
import { PageBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";

export const clientLoader = async () => {
  return {
    apiKey: await getApiKey(),
  };
};

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const apiKey = formData.get("apiKey");
  await setApiKey(String(apiKey || ""));
  enqueueSnackbar("Settings saved", { variant: "success" });
  return null;
};

export default function SettingsPage() {
  const loaderData = useLoaderData<typeof clientLoader>();
  const builder = new PageBuilder("Settings");

  builder.section("Gemini API key");
  builder.say(
    <>
      Grab your API key from the{" "}
      <Link href="https://makersuite.google.com/app/prompts/new_freeform">
        Google AI Studio
      </Link>
      .
    </>
  );
  builder.textField({
    type: "password",
    label: "API Key",
    name: "apiKey",
    defaultValue: loaderData.apiKey,
  });
  builder
    .buttonBar()
    .addButton({ label: "Save", type: "submit", variant: "contained" });

  return <Form method="POST">{builder.build()}</Form>;
}
