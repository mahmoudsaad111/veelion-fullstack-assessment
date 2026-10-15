import { NextResponse } from "next/server";
import { BackendError } from "@/lib/backendApi";

// Builds the error response for the route handlers. A BackendError keeps the
// backend's status (400, 404, 502...). Anything else is an unexpected 500.
export function errorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof BackendError) {
    return NextResponse.json({ error: { message: error.message } }, { status: error.status });
  }

  return NextResponse.json({ error: { message: fallbackMessage } }, { status: 500 });
}
