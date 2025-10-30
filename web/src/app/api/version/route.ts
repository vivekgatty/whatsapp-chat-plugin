import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.VERCEL_GIT_BRANCH ?? null,
    url: process.env.VERCEL_URL ?? null,
    builtAt: new Date().toISOString(),
  });
}
