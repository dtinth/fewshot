import { Alert, Link } from "@mui/material";

export interface ConfigureBanner {}
export function ConfigureBanner() {
  return (
    <Alert severity="warning" variant="outlined" sx={{ alignSelf: "stretch" }}>
      Please configure your Gemini API key in the{" "}
      <Link href="/settings">settings</Link> page.
    </Alert>
  );
}
