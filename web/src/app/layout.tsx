import ClickRewriteForGatedNav from "@/components/ClickRewriteForGatedNav";
import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "../components/SiteFooter";
import GlobalTopBar from "../components/GlobalTopBar";

export const metadata: Metadata = {
  title: "Chatmadi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
        <style>{
      html[data-hide-header="1"] header,
      html[data-hide-header="1"] nav { display: none !important; }
    }</style>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <NavGate />
        <GlobalTopBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ClickRewriteForGatedNav />
  </body>
    </html>
  );
}


