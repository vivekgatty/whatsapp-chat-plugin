"use client";

import React, { useMemo, useState, useEffect } from "react";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayCfg = { holiday: boolean; from: string; to: string };
export type HoursState = Record<DayKey, DayCfg>;

const DAY_NAMES: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const defaultHours: HoursState = {
  mon: { holiday: false, from: "09:00", to: "18:00" },
  tue: { holiday: false, from: "09:00", to: "18:00" },
  wed: { holiday: false, from: "09:00", to: "18:00" },
  thu: { holiday: false, from: "09:00", to: "18:00" },
  fri: { holiday: false, from: "09:00", to: "18:00" },
  sat: { holiday: false, from: "10:00", to: "14:00" },
  sun: { holiday: true, from: "09:00", to: "18:00" },
};

function to12h(t: string) {
  const [H, M] = t.split(":").map(Number);
  const am = H < 12;
  const h = ((H + 11) % 12) + 1;
  const mm = String(M).padStart(2, "0");
  return `${String(h).padStart(2, "0")}:${mm} ${am ? "AM" : "PM"}`;
}

function times30() {
  const arr: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return arr;
}

type Props = {
  value?: HoursState;
  onChange?: (v: HoursState) => void;
};

export default function HoursEditor({ value, onChange }: Props) {
  const options = useMemo(() => times30(), []);
  const [state, setState] = useState<HoursState>(value ?? defaultHours);

  useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);

  function upd(day: DayKey, patch: Partial<DayCfg>) {
    setState((s) => ({ ...s, [day]: { ...s[day], ...patch } }));
  }

  return (
    <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-700">
      {(Object.keys(DAY_NAMES) as DayKey[]).map((day) => {
        const cfg = state[day];
        return (
          <div key={day} className="grid grid-cols-[60px_1fr_1fr_1fr] items-center gap-3 px-4 py-3">
            <div className="text-sm text-zinc-300">{DAY_NAMES[day]}</div>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-emerald-600"
                checked={cfg.holiday}
                onChange={(e) => upd(day, { holiday: e.target.checked })}
              />
              <span className="text-sm text-zinc-400">Holiday</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="w-8 text-sm text-zinc-400">From</span>
              <select
                disabled={cfg.holiday}
                className="w-36 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5"
                value={cfg.from}
                onChange={(e) => upd(day, { from: e.target.value })}
              >
                {options.map((t) => (
                  <option key={t} value={t}>
                    {to12h(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 text-sm text-zinc-400">To</span>
              <select
                disabled={cfg.holiday}
                className="w-36 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5"
                value={cfg.to}
                onChange={(e) => upd(day, { to: e.target.value })}
              >
                {options.map((t) => (
                  <option key={t} value={t}>
                    {to12h(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
