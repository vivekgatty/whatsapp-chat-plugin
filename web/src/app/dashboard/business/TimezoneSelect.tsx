"use client";

import { useEffect, useState } from "react";

type Props = {
  name?: string;
  defaultValue?: string;
  style?: React.CSSProperties;
};

export default function TimezoneSelect({
  name = "timezone",
  defaultValue = "UTC",
  style,
}: Props) {
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    try {
      // Modern browsers
      const sup = (Intl as any)?.supportedValuesOf?.("timeZone");
      if (Array.isArray(sup) && sup.length) {
        setZones(sup);
        return;
      }
    } catch {}
    // Fallback shortlist so the field is always usable
    setZones([
      "UTC",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Dubai",
      "Australia/Sydney",
    ]);
  }, []);

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #21304a",
        background: "#0f172a",
        color: "#e5ecf5",
        marginTop: 6,
        ...style,
      }}
    >
      {zones.map((z) => (
        <option key={z} value={z}>
          {z}
        </option>
      ))}
    </select>
  );
}
