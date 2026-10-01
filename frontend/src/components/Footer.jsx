export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.14em]">
          © {new Date().getFullYear()} Studio Portfolio
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.14em]">
          Residential — Commercial — Interiors
        </p>
      </div>
    </footer>
  )
}
