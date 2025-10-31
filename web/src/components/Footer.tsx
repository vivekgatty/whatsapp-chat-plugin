import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mt-12 py-6 text-sm">
      <div className="mx-auto max-w-5xl px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="opacity-80">© {year} Chatmadi</div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/privacy-policy" className="underline hover:no-underline">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="underline hover:no-underline">Terms &amp; Conditions</Link>
          <Link href="/refund-policy" className="underline hover:no-underline">Cancellations &amp; Refunds</Link>
          <Link href="/contact" className="underline hover:no-underline">Contact Us</Link>
        </nav>
      </div>
    </footer>
  );
}