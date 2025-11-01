/** stamp: 2025-11-01_08-30-23 */
import SiteFooter from "@/components/SiteFooter";
export const dynamic = "force-dynamic";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (<>{children}<SiteFooter /></>);
}