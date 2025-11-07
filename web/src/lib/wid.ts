"use client";

// Tiny helper for docs pages: store a 'docs_wid' in localStorage and read it back
export function useWid(): [string, (v: string)=>void] {
  const [wid, setWid] = require("react").useState("");
  require("react").useEffect(() => {
    try {
      const v = localStorage.getItem("docs_wid") || "";
      if (v) setWid(v);
    } catch {}
  }, []);
  function save(v: string) {
    setWid(v);
    try { localStorage.setItem("docs_wid", v); } catch {}
  }
  return [wid, save];
}
