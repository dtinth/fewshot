import { Link } from "@mui/material";
import { ReactNode } from "react";

export function link(url: string, children: ReactNode) {
  return <Link href={url}>{children}</Link>;
}
