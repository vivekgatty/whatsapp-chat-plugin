export type HoursDay = { closed?: boolean; open?: string; close?: string };
export type HoursMap = {
  mon: HoursDay; tue: HoursDay; wed: HoursDay; thu: HoursDay;
  fri: HoursDay; sat: HoursDay; sun: HoursDay;
};

export const DEFAULT_TZ = "Asia/Kolkata";
export const DEFAULT_HOURS: HoursMap = {
  mon:{open:"09:30",close:"18:30",closed:false},
  tue:{open:"09:30",close:"18:30",closed:false},
  wed:{open:"09:30",close:"18:30",closed:false},
  thu:{open:"09:30",close:"18:30",closed:false},
  fri:{open:"09:30",close:"18:30",closed:false},
  sat:{open:"10:00",close:"16:00",closed:false},
  sun:{closed:true}
};

function localDateInTZ(tz: string) {
  // Convert now -> tz by using toLocaleString then new Date(...) trick
  const s = new Date().toLocaleString("en-US", { timeZone: tz || DEFAULT_TZ });
  return new Date(s);
}

function hmToMinutes(hm: string | undefined): number | null {
  if (!hm) return null;
  const m = hm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(mi)) return null;
  return h*60 + mi;
}

export function isOffNow(tz: string, hours: HoursMap, override?: { h?: number; m?: number; dow?: number; closedFlag?: boolean }): boolean {
  const d = localDateInTZ(tz || DEFAULT_TZ);
  const dow = override?.dow ?? d.getDay(); // 0=Sun..6=Sat
  const hour = override?.h ?? d.getHours();
  const min  = override?.m ?? d.getMinutes();

  const mapKey = ["sun","mon","tue","wed","thu","fri","sat"][dow] as keyof HoursMap;
  const dayCfg = hours?.[mapKey] || { closed:true };

  if (override?.closedFlag === true) return true;
  if (dayCfg.closed) return true;

  const nowMin = hour*60 + min;
  const openMin  = hmToMinutes(dayCfg.open);
  const closeMin = hmToMinutes(dayCfg.close);
  if (openMin == null || closeMin == null) return true;

  return nowMin < openMin || nowMin > closeMin;
}

export function decideKind(tz: string, hours: HoursMap, override?: { h?: number; m?: number; dow?: number; closedFlag?: boolean }): "off_hours" | "greeting" {
  return isOffNow(tz, hours, override) ? "off_hours" : "greeting";
}
