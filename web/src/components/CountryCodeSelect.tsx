"use client";

import React, { useMemo } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

type Props = {
  name: string;
  value?: string;              // e.g. "+91"
  onChange?: (v: string) => void;
  className?: string;
};

export default function CountryCodeSelect({ name, value = "+91", onChange, className }: Props) {
  const items = useMemo(() => {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const seen = new Set<string>();
    // Build {dial:"+<code>", label:"Country (+code)"} and dedupe by dial
    const list = getCountries()
      .map((cc) => {
        try {
          const dial = "+" + getCountryCallingCode(cc as any);
          const name = dn.of(cc) || cc;
          return { dial, label: `${name} (${dial})`, sort: Number(dial.replace("+","")) };
        } catch {
          return null;
        }
      })
      .filter((x): x is {dial:string; label:string; sort:number} => !!x)
      .filter((x) => {
        if (seen.has(x.dial)) return false;
        seen.add(x.dial);
        return true;
      })
      .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));
    return list;
  }, []);

  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className ?? "mt-1 w-40 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"}
    >
      {items.map((it) => (
        <option key={it.dial} value={it.dial}>{it.label}</option>
      ))}
    </select>
  );
}
