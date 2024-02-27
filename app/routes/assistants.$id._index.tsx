import {
  Add,
  DataObject,
  Edit,
  FileDownload,
  FileUpload,
} from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useStore } from "@nanostores/react";
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
} from "@remix-run/react";
import { ReadableAtom, atom } from "nanostores";
import Papa from "papaparse";
import { ReactNode, useRef, useState } from "react";
import { ConfigureBanner } from "~/ConfigureBanner.client";
import { addAsExampleMap, getAssistant, putAssistant } from "~/assistants";
import { AssistantDocument } from "~/db/schema";
import { getApiKey, runAssistant } from "~/inference";
import { PageBuilder } from "~/utils/UiBuilder";
import { enqueueSnackbar } from "~/utils/enqueueSnackbar";
import { generateId } from "~/utils/generateId";

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const id = args.params.id;
  const assistant = await getAssistant(id);
  const needsConfiguring = !(await getApiKey());
  return { id, assistant, needsConfiguring };
};

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const id = args.params.id;
  const assistant = await getAssistant(id);
  const submittedInputs: Record<string, string> = {};
  const columns = assistant.dataPrompt.columns;
  for (const { columnId, isInput } of columns) {
    if (!isInput) continue;
    submittedInputs[columnId] = String(
      formData.get(`inputs.${columnId}`) || ""
    );
  }
  const result = await runAssistant(assistant, submittedInputs);
  const { output } = result;
  return { output };
};

export default function AssistantPage() {
  const revalidator = useRevalidator();
  const { id, assistant } = useLoaderData<typeof clientLoader>();
  const builder = new PageBuilder(`Assistant: ${assistant.name}`);
  builder
    .buttonBarBuilder()
    .button({
      label: "Edit assistant",
      href: `/assistants/${id}/edit`,
      variant: "outlined",
    })
    .button({
      label: "Import",
      startIcon: <FileUpload />,
      onClick: async () => {
        const [handle] = await showOpenFilePicker({
          types: [
            {
              description: "JSON files",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
        });
        const file = await handle.getFile();
        const newAssistant = AssistantDocument.parse(
          JSON.parse(await file.text())
        );
        newAssistant.id = assistant.id;
        await putAssistant(newAssistant);
        revalidator.revalidate();
      },
    })
    .button({
      label: "Export",
      startIcon: <FileDownload />,
      onClick: async () => {
        const blob = new Blob([JSON.stringify(assistant)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${assistant.id}.json`;
        a.click();
      },
    })
    .button({
      label: "Edit JSON",
      startIcon: <DataObject />,
      href: `/assistants/${id}/json`,
    });

  builder.section("Model prompt");
  builder.say(
    <>
      <strong>Prompt:</strong> {assistant.dataPrompt.preamble}
    </>
  );

  builder.section("Use the model");
  builder.add(<ModelUseForm assistant={assistant} />);

  builder.section("Input–output examples");
  builder.add(<InputOutputExamples assistant={assistant} />);
  builder
    .buttonBarBuilder()
    .button({
      label: "Add an example",
      href: `/assistants/${id}/examples/new`,
      startIcon: <Add />,
    })
    .button({
      label: "Import CSV",
      startIcon: <FileUpload />,
      onClick: async () => {
        const [handle] = await showOpenFilePicker({
          types: [
            {
              description: "CSV files",
              accept: {
                "text/csv": [".csv"],
              },
            },
          ],
        });
        const file = await handle.getFile();
        const text = await file.text();
        const { data } = Papa.parse(text, { header: true });

        if (!data.length) {
          alert("No data found in the CSV file");
          return;
        }

        const header = Object.keys(data[0] as Record<string, string>).sort();
        const expectedHeaders = assistant.dataPrompt.columns
          .map((c) => c.displayName)
          .sort();
        if (JSON.stringify(header) !== JSON.stringify(expectedHeaders)) {
          alert("The CSV file does not match the expected columns");
          return;
        }

        const newAssistant = AssistantDocument.parse(
          JSON.parse(JSON.stringify(assistant))
        );
        const newRows: (typeof newAssistant)["dataPrompt"]["rows"] = [];
        for (const row of data) {
          const newRow: (typeof newRows)[number] = {
            rowId: generateId(),
            columnBindings: {},
          };
          for (const column of newAssistant.dataPrompt.columns) {
            newRow.columnBindings[column.columnId] = (
              row as Record<string, string>
            )[column.displayName];
          }
          newRows.push(newRow);
        }

        newAssistant.dataPrompt.rows = newRows;
        await putAssistant(newAssistant);
        enqueueSnackbar("CSV imported", { variant: "success" });
        revalidator.revalidate();
      },
    })
    .button({
      label: "Export CSV",
      startIcon: <FileDownload />,
      onClick: async () => {
        const { rows, columns } = assistant.dataPrompt;
        const csv = Papa.unparse({
          fields: columns.map((c) => c.displayName),
          data: rows.map((r) =>
            columns.map((c) => r.columnBindings[c.columnId])
          ),
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${assistant.id}.csv`;
        a.click();
      },
    });

  return builder.build();
}

interface ModelUseForm {
  assistant: AssistantDocument;
}
function ModelUseForm(props: ModelUseForm) {
  const loaderData = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { assistant } = props;
  const builder = new PageBuilder();
  const output = actionData?.output;
  const columns = assistant.dataPrompt.columns;
  const ref = useRef<HTMLFormElement>(null);

  builder.add(loaderData.needsConfiguring ? <ConfigureBanner /> : <></>);

  for (const column of columns) {
    if (!column.isInput) continue;
    builder.textField({
      label: column.displayName,
      name: `inputs.${column.columnId}`,
      large: true,
      multiline: true,
      keepLabelOnTop: true,
    });
  }

  builder.buttonBarBuilder().submitButton({
    label: "Run model",
    loadable: { loading: navigation.state === "submitting" },
  });

  for (const column of columns) {
    if (column.isInput) continue;
    const outputText = output?.[column.columnId];
    builder.textField({
      label: column.displayName,
      name: `outputs.${column.columnId}`,
      large: true,
      multiline: true,
      color: "secondary",
      readOnly: true,
      disabled: !outputText,
      value: outputText,
      keepLabelOnTop: true,
    });
  }

  builder.buttonBarBuilder().button({
    label: "Add as example",
    startIcon: <Add />,
    color: "secondary",
    disabled: !output,
    onClick: async () => {
      const form = ref.current;
      if (!form) return;
      const columnBindings = new Map<string, string>();
      for (const column of columns) {
        const input = form.elements.namedItem(
          `${column.isInput ? "inputs" : "outputs"}.${column.columnId}`
        ) as HTMLTextAreaElement;
        columnBindings.set(column.columnId, input.value);
      }
      const id = generateId();
      addAsExampleMap.set(id, columnBindings);
      navigate(`/assistants/${assistant.id}/examples/${id}`);
    },
  });

  return (
    <Form method="POST" style={{ width: "100%" }} ref={ref}>
      {builder.build()}
    </Form>
  );
}

interface InputOutputExamples {
  assistant: AssistantDocument;
}
function InputOutputExamples(props: InputOutputExamples) {
  const { assistant } = props;
  const [$expanded] = useState(() => atom(false));
  return (
    <>
      <FormControlLabel
        control={
          <AtomConnector atom={$expanded}>
            {(expanded) => (
              <Checkbox
                checked={expanded}
                onChange={(e) => $expanded.set(e.target.checked)}
              />
            )}
          </AtomConnector>
        }
        label="Expand text"
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {assistant.dataPrompt.columns.map((column) => (
                <TableCell key={column.columnId}>
                  {column.displayName}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assistant.dataPrompt.rows.map((row) => (
              <TableRow key={row.rowId}>
                {Object.entries(row.columnBindings).map(([columnId, cell]) => (
                  <TableCell key={columnId} sx={{ verticalAlign: "top" }}>
                    <IoText text={cell} $expanded={$expanded} />
                  </TableCell>
                ))}
                <TableCell sx={{ verticalAlign: "top" }}>
                  <IconButton
                    href={`/assistants/${assistant.id}/examples/${row.rowId}`}
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export interface AtomConnector<T> {
  atom: ReadableAtom<T>;
  children: (value: T) => React.ReactNode;
}

export function AtomConnector<T>(props: AtomConnector<T>) {
  return <>{props.children(useStore(props.atom))}</>;
}

export interface IoText {
  text: string;
  $expanded: ReadableAtom<boolean>;
}

export function IoText(props: IoText) {
  const expanded = useStore(props.$expanded);
  return expanded ? (
    <div style={{ whiteSpace: "pre-wrap", width: "100%" }}>{props.text}</div>
  ) : (
    <MultilineText>{props.text}</MultilineText>
  );
}

export interface MultilineText {
  children?: ReactNode;
}

export function MultilineText(props: MultilineText) {
  return (
    <div
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {props.children}
    </div>
  );
}
