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
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <GlobalTopBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}