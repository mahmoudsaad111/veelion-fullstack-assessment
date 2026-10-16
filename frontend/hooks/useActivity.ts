"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { filterActivity } from "@/lib/activity";
import { getErrorMessage, requestJson } from "@/lib/requestJson";
import type { ActivityLog } from "@/types/api";

export function useActivity() {
  // Store the loaded data and search text; derive the visible list below.
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    requestJson<unknown>("/api/activity", { signal: controller.signal })
      .then((data) => {
        // Treat any non-array response as invalid instead of displaying an error body as the list.
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setActivity(data as ActivityLog[]);
      })
      .catch((caught) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(caught, "Could not load activity right now."));
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

  const visibleActivity = useMemo(() => filterActivity(activity, query), [activity, query]);

  return {
    activity,
    visibleActivity,
    query,
    setQuery,
    loading,
    error,
    retry,
  };
}
