import {
  Button,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { get } from "idb-keyval";
import { getStore } from "~/db/keyval";
import { IndexDocument } from "~/db/schema";
import { PageBuilder } from "~/utils/UiBuilder";

export const meta: MetaFunction = () => {
  return [
    { title: "fewshot" },
    {
      name: "description",
      content: "Leverage few-shot learning to prompt Gemini AI model",
    },
  ];
};

export const clientLoader = async () => {
  const index = IndexDocument.parse(await get("index", getStore()));
  return index;
};

export default function Index() {
  const index = useLoaderData<typeof clientLoader>();
  const builder = new PageBuilder("Your assistants");
  builder.say(
    <strong>fewshot</strong>,
    " lets you create AI assistants leveraging few-shot learning.",
    " Provide a few input-output examples, then you can ask the assistant to generate outputs based on new inputs."
  );
  builder.add(
    <Stack spacing={2} direction="row">
      <Button variant="contained" href="/create">
        Create new assistant
      </Button>
    </Stack>
  );
  if (index.assistants.length === 0) {
    builder.say(
      "You don't have any assistants yet. Get started by creating one!"
    );
  } else {
    builder.add(
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {index.assistants.map((assistant) => (
              <TableRow key={assistant.id}>
                <TableCell>
                  <Link href={`/assistants/${assistant.id}`}>
                    {assistant.name}
                  </Link>
                </TableCell>
                <TableCell>{assistant.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return builder.build();
}
