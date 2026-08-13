export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-[#0B6839] px-5 py-8 text-white md:px-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="inline-block rotate-[-2deg] bg-[#F72585] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-white">
            HH Goa 2026 / Frame Generator
          </p>
          <p className="font-display -ml-1 mt-4 text-[clamp(2.4rem,7vw,6.5rem)] uppercase leading-[0.82]">
            TEAM APICALYPSE
          </p>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.28em] text-white">
            Karnavati University
          </p>
        </div>
        <p className="font-serif-accent max-w-sm text-right text-lg text-white/85">
          Built for instant browser-side frames. No login. No server photo upload.
        </p>
      </div>
    </footer>
  );
}
