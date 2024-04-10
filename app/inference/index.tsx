import { get, set } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { AssistantDocument } from "~/db/schema";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";

export interface RunAssistantResult {
  output: Record<string, string>;
}

export async function runAssistant(
  assistant: Pick<AssistantDocument, "dataPrompt">,
  inputs: Record<string, string>
): Promise<RunAssistantResult> {
  let apiKey = await getApiKey();
  if (!apiKey) {
    apiKey = prompt("Enter your Gemini API key");
    if (!apiKey) {
      throw new Error("No API key");
    }
    await set("apiKey", apiKey, getStore());
  }

  const columns = assistant.dataPrompt.columns;
  const parts: { text: string }[] = [];
  if (assistant.dataPrompt.preamble.trim()) {
    parts.push({ text: assistant.dataPrompt.preamble });
  }
  for (const rows of assistant.dataPrompt.rows) {
    for (const { columnId, displayName } of columns) {
      parts.push({ text: displayName + " " + rows.columnBindings[columnId] });
    }
  }
  for (const { columnId, displayName, isInput } of columns) {
    if (isInput) {
      parts.push({ text: displayName + " " + (inputs[columnId] || "") });
    } else {
      parts.push({ text: displayName + " " });
      break;
    }
  }

  if (apiKey === "meow") {
    const output: Record<string, string> = {};
    for (const { columnId, isInput } of columns) {
      if (isInput) continue;
      output[columnId] = "meow";
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { output };
  }

  const request = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
      stopSequences: [],
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
    ],
  };
  console.log("Request to Gemini", request);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?${new URLSearchParams(
      { key: apiKey }
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    const text = await response.text();
    enqueueSnackbar(text, { variant: "error" });
    return { output: {} };
  }

  const data = await response.json();
  console.log("Response from Gemini", data);

  const output: Record<string, string> = {};
  for (const { columnId, isInput } of columns) {
    if (isInput) continue;
    output[columnId] = data.candidates[0].content.parts[0].text;
    break;
  }
  return { output };
}

export async function getApiKey() {
  return await get("apiKey", getStore());
}

export async function setApiKey(apiKey: string) {
  return await set("apiKey", apiKey, getStore());
}
