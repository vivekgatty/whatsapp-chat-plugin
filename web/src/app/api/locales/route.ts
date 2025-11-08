import { NextResponse } from "next/server";
import {
  LOCALE_OPTIONS,
  IN_CORE_22,
  GLOBAL_MUSTS,
} from "@/lib/locales";

// Always serve fresh; no caching
export const revalidate = 0;

export function GET() {
  return NextResponse.json({
    ok: true,
    total: LOCALE_OPTIONS.length,
    locales: LOCALE_OPTIONS,         // [{ value, label, dir }]
    groups: {
      IN_CORE_22,
      GLOBAL_MUSTS,
    },
  });
}
