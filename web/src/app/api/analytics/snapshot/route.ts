import { NextResponse } from "next/server";
import { aggregateDailyAnalytics } from "@/lib/analytics/aggregator";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const date = body.date ?? new Date().toISOString().split("T")[0];

    const result = await aggregateDailyAnalytics(date);

    return NextResponse.json({
      success: true,
      date,
      workspacesProcessed: result.count,
    });
  } catch (error) {
    console.error("Analytics snapshot error:", error);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
