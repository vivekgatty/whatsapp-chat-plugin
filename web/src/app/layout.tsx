/** cleaned, stamp: 2025-10-31_14-08-20 */
export const metadata = {
  title: "Chatmadi",
  description: "WhatsApp chat widget",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}