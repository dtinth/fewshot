import { ContentCopy } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, ReactNode, createElement } from "react";

type UiBuildable = ReactNode | (() => ReactNode);

export class UiBuilder {
  protected elements: UiBuildable[] = [];
  private nextKey: [string, number] = ["", 1];

  constructor() {}

  protected generateKey() {
    return `${this.nextKey[0]}.${this.nextKey[1]++}`;
  }

  add(element: UiBuildable) {
    const key = this.generateKey();
    if (typeof element === "function") {
      this.elements.push(() => <Fragment key={key}>{element()}</Fragment>);
    } else {
      this.elements.push(<Fragment key={key}>{element}</Fragment>);
    }
    return this;
  }

  tap(callback: (builder: this) => void) {
    callback(this);
    return this;
  }

  build() {
    return <>{this.elements.map((c) => (typeof c === "function" ? c() : c))}</>;
  }
}

export class PageBuilder extends UiBuilder {
  constructor(title?: string) {
    super();
    if (title) {
      this.add(
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      );
    }
  }

  section(title: string) {
    return this.add(
      <Typography variant="h5" sx={{ pt: 3 }}>
        {title}
      </Typography>
    );
  }

  say(...text: ReactNode[]) {
    return this.add(
      <Typography variant="body1">
        {createElement(Fragment, null, ...text)}
      </Typography>
    );
  }

  buttonBarBuilder() {
    const builder = new ButtonBarBuilder();
    this.add(() => builder.build());
    return builder;
  }

  textField(options: {
    label: string;
    name: string;
    required?: boolean;
    defaultValue?: string;
    value?: string;
    multiline?: boolean;
    large?: boolean;
    readOnly?: boolean;
    color?: UiColor;
    keepLabelOnTop?: boolean;
    disabled?: boolean;
    type?: "text" | "password";
    monospace?: boolean;
    placeholder?: string;
    helperText?: string;
  }) {
    return this.add(
      <TextField
        variant="outlined"
        multiline={options.multiline}
        label={options.label}
        name={options.name}
        required={options.required}
        defaultValue={options.defaultValue}
        value={options.value}
        fullWidth={options.large}
        type={options.type}
        placeholder={options.placeholder}
        helperText={options.helperText}
        InputProps={{
          readOnly: options.readOnly,
          sx: options.monospace
            ? {
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }
            : undefined,
          ...(options.readOnly && !options.disabled
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="copy"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          options.value || options.defaultValue || ""
                        );
                      }}
                      edge="end"
                    >
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : {}),
        }}
        InputLabelProps={{ shrink: options.keepLabelOnTop }}
        color={options.color}
        disabled={options.disabled}
      />
    );
  }

  submitButton(options: { label: string }) {
    return this.add(
      <Button type="submit" variant="contained">
        {options.label}
      </Button>
    );
  }

  override build() {
    return (
      <Stack spacing={2} direction="column" alignItems="start">
        {super.build()}
      </Stack>
    );
  }
}

type UiColor = "primary" | "secondary" | "success" | "error";

export class ButtonBarBuilder extends UiBuilder {
  override build() {
    return (
      <Stack spacing={2} direction="row" alignSelf="stretch">
        {super.build()}
      </Stack>
    );
  }

  button(options: {
    label?: string;
    href?: string;
    variant?: "outlined" | "contained";
    color?: UiColor;
    startIcon?: ReactNode;
    type?: "submit" | "button";
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    loadable?: { loading: boolean };
  }) {
    const ButtonComponent = options.loadable ? LoadingButton : Button;
    return this.add(
      <ButtonComponent
        variant={options.variant}
        href={options.href}
        startIcon={options.startIcon}
        onClick={options.onClick}
        type={options.type}
        color={options.color}
        disabled={options.disabled}
        {...(options.loadable ? { loading: options.loadable.loading } : {})}
      >
        {options.label}
      </ButtonComponent>
    );
  }

  submitButton(options: Parameters<this["button"]>[0]) {
    return this.button({ type: "submit", variant: "contained", ...options });
  }
}
