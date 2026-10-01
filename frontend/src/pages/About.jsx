import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const GOLD = '#D4AF37'

export default function About() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <p className="label-eyebrow mb-3">About</p>
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Dir Architects</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em]" style={{ color: GOLD }}>
          Multidisciplinary Design Studio
        </p>
        <div className="mx-auto mt-10 flex flex-col items-center gap-2">
          <div
            className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-sm border bg-surface"
            style={{ borderColor: `${GOLD}4D`, boxShadow: `0 0 30px -8px ${GOLD}40` }}
          >
            <img src={logo} alt="Dir Architects" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 sm:pb-28">
        <p className="text-lg leading-relaxed text-ink">
          Based in Addis Ababa, Dir Architects is a multidisciplinary design studio built by a
          group of architects and designers with a shared approach to work — measured,
          collaborative, and grounded in context — providing a full-service architectural,
          interior design, and construction firm dedicated to transforming modern spaces into
          timeless architectural statements.
        </p>
        <p className="mt-6 leading-relaxed text-ink-muted">
          At Dir Architects, we take your project from a blank page to a fully built reality —
          handling architectural design, interior styling, and full construction under one roof.
          No miscommunications, no extra stress, just exceptional quality delivered on time in
          Addis Ababa.
        </p>
      </section>

      <section className="border-t border-line" style={{ background: `linear-gradient(180deg, ${GOLD}0D, transparent)` }}>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Build smarter. Design bolder.
          </h2>
          <p className="mt-3 text-ink-muted">
            Contact Dir Architects today and let's bring your dream space to life.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-mono text-sm tracking-wide text-bg transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: GOLD, boxShadow: `0 0 24px -6px ${GOLD}80` }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}