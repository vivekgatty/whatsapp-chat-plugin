/** stamp: 2025-11-01_07-59-29 */
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Chatmadi",
  description: "WhatsApp chat widget",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}