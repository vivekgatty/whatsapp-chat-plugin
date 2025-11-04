import SiteFooter from "../../components/SiteFooter";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}