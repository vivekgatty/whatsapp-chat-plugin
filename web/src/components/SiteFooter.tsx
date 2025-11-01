export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-800 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="text-slate-400">© 2025 Chatmadi</div>
        <nav className="flex gap-4">
          <a className="underline text-slate-300 hover:text-white" href="/privacy">Privacy Policy</a>
          <a className="underline text-slate-300 hover:text-white" href="/terms">Terms & Conditions</a>
          <a className="underline text-slate-300 hover:text-white" href="/refunds">Cancellations & Refunds</a>
          <a className="underline text-slate-300 hover:text-white" href="/contact">Contact Us</a>
        </nav>
      </div>
    </footer>
  );
}