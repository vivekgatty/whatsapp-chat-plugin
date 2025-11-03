export default function SiteFooter() {
  return (
    <footer className="mt-12 w-full border-t border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row">
        <div className="text-slate-400">© 2025 Chatmadi</div>
        <nav className="flex gap-4">
          <a className="text-slate-300 underline hover:text-white" href="/privacy">
            Privacy Policy
          </a>
          <a className="text-slate-300 underline hover:text-white" href="/terms">
            Terms & Conditions
          </a>
          <a className="text-slate-300 underline hover:text-white" href="/refunds">
            Cancellations & Refunds
          </a>
          <a className="text-slate-300 underline hover:text-white" href="/contact">
            Contact Us
          </a>
        </nav>
      </div>
    </footer>
  );
}
