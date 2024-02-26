import { useSnackbar } from "notistack";
import { useEffect } from "react";

type EnqueueSnackbar = ReturnType<typeof useSnackbar>["enqueueSnackbar"];
let enqueueFn: EnqueueSnackbar | undefined;

export function enqueueSnackbar(...args: Parameters<EnqueueSnackbar>) {
  enqueueFn?.(...args);
}

export function EnqueueSnackbarProvider() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    enqueueFn = enqueueSnackbar;
    return () => {
      enqueueFn = undefined;
    };
  }, [enqueueSnackbar]);
  return null;
}
