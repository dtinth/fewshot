import { Button, Stack, TextField, Typography } from "@mui/material";
import { Fragment, ReactNode } from "react";

export class UiBuilder {
  private components: ReactNode[] = [];

  constructor(title: string) {
    this.add(
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
    );
  }

  add(element: ReactNode) {
    this.components.push(
      <Fragment key={this.components.length}>{element}</Fragment>
    );
  }

  say(text: string) {
    this.add(
      <Typography variant="body1" gutterBottom>
        {text}
      </Typography>
    );
  }

  textField(options: {
    label: string;
    name: string;
    required?: boolean;
    defaultValue?: string;
    multiline?: boolean;
    large?: boolean;
  }) {
    this.add(
      <TextField
        variant="outlined"
        multiline={options.multiline}
        label={options.label}
        name={options.name}
        required={options.required}
        defaultValue={options.defaultValue}
        fullWidth={options.large}
      />
    );
  }

  submitButton(options: { label: string }) {
    this.add(
      <Button type="submit" variant="contained">
        {options.label}
      </Button>
    );
  }

  public build() {
    return (
      <>
        <Stack
          spacing={2}
          direction="column"
          alignItems="start"
          maxWidth={"960px"}
        >
          {this.components}
        </Stack>
      </>
    );
  }
}
