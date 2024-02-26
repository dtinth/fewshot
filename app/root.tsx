import {
  LinkProps as MuiLinkProps,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import {
  Link,
  Links,
  Meta,
  Outlet,
  LinkProps as RemixLinkProps,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { SnackbarProvider } from "notistack";
import { forwardRef, useState } from "react";
import "./style.css";
import { EnqueueSnackbarProvider } from "./utils/enqueueSnackbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ opacity: 0.5, fontWeight: 500, marginBottom: 8 }}>
          fewshot
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const RemixLinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<MuiLinkProps, "to"> & { href: RemixLinkProps["to"] }
>(function RemixLinkBehavior(props, ref) {
  const { href, ...other } = props;
  return <Link ref={ref} to={href} {...(other as object)} />;
});

export default function App() {
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
        <ScopedCssBaseline>
          <SnackbarProvider>
            <EnqueueSnackbarProvider />
            <Outlet />
          </SnackbarProvider>
        </ScopedCssBaseline>
      </ThemeProvider>
    </>
  );
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
