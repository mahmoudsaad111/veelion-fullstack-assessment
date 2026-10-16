"use client";

import { useCallback, useEffect, useState } from "react";
import { isTasksSummary } from "@/lib/reports";
import { getErrorMessage, requestJson } from "@/lib/requestJson";
import type { TasksSummary } from "@/types/api";

export function useTasksSummary() {
  const [summary, setSummary] = useState<TasksSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    requestJson<unknown>("/api/reports/tasks-summary", { signal: controller.signal })
      .then((data) => {
        // Reject responses that do not match the documented shape, such as an error body.
        if (!isTasksSummary(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setSummary(data);
      })
      .catch((caught) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(caught, "Could not load the report right now."));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    // Cancel the request if the page is left or a new one starts (Retry).
    return () => controller.abort();
  }, [reloadCount]);

  const retry = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  return { summary, loading, error, retry };
}
