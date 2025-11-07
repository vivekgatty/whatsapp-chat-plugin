export const LS_WID = "chatmadi_docs_wid";

export function getWid(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(LS_WID) || ""; } catch { return ""; }
}

export function setWid(v: string) {
  try { localStorage.setItem(LS_WID, (v || "").trim()); } catch {}
}
