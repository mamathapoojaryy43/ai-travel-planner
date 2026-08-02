"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <ErrorMessage
        title="Unexpected Page Error"
        message={error.message || "Failed to load the requested page."}
        onRetry={() => reset()}
      />
    </div>
  );
}
