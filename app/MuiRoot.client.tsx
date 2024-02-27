import { Settings } from "@mui/icons-material";
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import { Link, LinkProps as RemixLinkProps } from "@remix-run/react";
import { SnackbarProvider } from "notistack";
import { ReactNode, forwardRef, useState } from "react";
import { EnqueueSnackbarProvider } from "./utils/enqueueSnackbar";

export interface MuiRoot {
  children: ReactNode;
}

export function MuiRoot(props: MuiRoot) {
  const [theme] = useState(() => {
    return createTheme({
      palette: {
        mode: "dark",
      },
      typography: {
        fontFamily: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ].join(","),
      },
      components: {
        MuiLink: {
          defaultProps: { component: RemixLinkBehavior } as MuiLinkProps,
        },
        MuiButtonBase: {
          defaultProps: { LinkComponent: RemixLinkBehavior },
        },
      },
    });
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <EnqueueSnackbarProvider />
          <AppBar position="static">
            <Container>
              <Toolbar>
                <Typography variant="h6" noWrap component="div">
                  <MuiLink href="/">fewshot</MuiLink>
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="large"
                  aria-label="settings"
                  color="inherit"
                  href="/settings"
                >
                  <Settings />
                </IconButton>
              </Toolbar>
            </Container>
          </AppBar>
          <Container>
            <Box padding={3}>{props.children}</Box>
          </Container>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}

const RemixLinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<MuiLinkProps, "to"> & { href: RemixLinkProps["to"] }
>(function RemixLinkBehavior(props, ref) {
  const { href, ...other } = props;
  return <Link ref={ref} to={href} {...(other as object)} />;
});

export interface Container {
  children?: ReactNode;
}
export function Container(props: Container) {
  return (
    <Box width="100%" maxWidth="960px" marginX="auto">
      {props.children}
    </Box>
  );
}
