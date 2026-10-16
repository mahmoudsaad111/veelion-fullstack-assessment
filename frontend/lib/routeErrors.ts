import { NextResponse } from "next/server";
import { BackendError } from "@/lib/backendApi";

// Centralize route error responses. BackendError preserves statuses such as 400,
// 404, and 502; unexpected errors return 500.
export function errorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof BackendError) {
    return NextResponse.json({ error: { message: error.message } }, { status: error.status });
  }

  return NextResponse.json({ error: { message: fallbackMessage } }, { status: 500 });
}
