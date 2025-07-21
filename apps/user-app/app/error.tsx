"use client"

import { ErrorPage } from "@repo/ui/errorpage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage 
      title="Something went wrong!"
      message={error.message || "An unexpected error occurred"}
    />
  );
}
