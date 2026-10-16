import { NextResponse } from "next/server";
import { getTasksSummaryFromBackend } from "@/lib/backendApi";
import { errorResponse } from "@/lib/routeErrors";

export async function GET() {
  try {
    const summary = await getTasksSummaryFromBackend();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    return errorResponse(error, "Unable to fetch the tasks summary.");
  }
}
