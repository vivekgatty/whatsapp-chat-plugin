import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import NavGate from "@/components/NavGate";
import ClickRewriteForGatedNav from "@/components/ClickRewriteForGatedNav";
import SiteFooter from "../components/SiteFooter";
import GlobalTopBar from "../components/GlobalTopBar";
import UsageCounter from "@/components/UsageCounter";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Chatmadi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <NavGate />
        <GlobalTopBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ClickRewriteForGatedNav />

        {/* dup-tabs-hide start */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
  (function(){
    function hideDupTabs(root){
      if(!root) return;
      var labels=["Overview","Widget settings","Templates","Analytics","Billing","Docs"];
      var candidates = root.querySelectorAll('main nav, main .tabs, main .subnav, main .tablist, main .nav');
      candidates.forEach(function(node){
        var txt = (node.textContent||"");
        var hits = 0; for (var i=0;i<labels.length;i++){ if (txt.indexOf(labels[i])>-1) hits++; }
        if (hits >= 4) {
          node.style.display = "none";
          node.setAttribute("data-removed","dup-tabs");
        }
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function(){ hideDupTabs(document); });
    } else {
      hideDupTabs(document);
    }
    var mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].addedNodes && muts[i].addedNodes.length){ hideDupTabs(document); break; }
      }
    });
    mo.observe(document.documentElement, { childList:true, subtree:true });
  })();
            `,
          }}
        />
        {/* dup-tabs-hide end */}

        <UsageCounter />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
