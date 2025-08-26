"use client"
import { ErrorPage } from "@repo/ui/errorpage";

export default function AuthError() {
  return (
    <ErrorPage 
      title="Authentication Error"
      message="Something went wrong during authentication. Please try again."
    />
  );
}