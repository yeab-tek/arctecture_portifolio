import { Link } from 'react-router-dom'
import { MessageCircle, ArrowDown } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import logo from '../assets/logo.png'

const GOLD = '#D4AF37'
const software = [
  'AutoCAD', 'Revit', 'Rhino', 'SketchUp', 'Blender', 'D5', 'Enscape', 'Photoshop', 'Illustrator',
]
const services = [
  'Architectural Design',
  'Interior Design & Construction',
  'Architectural Visualization',
]

function scrollToWork() {
  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
}

export default function ArchitectProfile() {
  const typedTagline = useTypewriter(services)

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div
        className="overflow-hidden rounded-sm border"
        style={{
          borderColor: `${GOLD}4D`,
          boxShadow: `0 0 60px -12px ${GOLD}59, 0 0 0 1px ${GOLD}1A inset`,
          background: 'linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0) 40%)',
        }}
      >
        <div
          className="h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
        />
        <div className="flex items-center gap-2 border-b border-line/60 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `${GOLD}CC` }} />
          <span className="h-2.5 w-2.5 rounded-full bg-blueprint/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/30" />
          <span className="ml-3 font-mono text-xs text-ink-muted">dir_architects.dwg</span>
        </div>
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="mx-auto lg:mx-0">
            <div
              className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-sm border bg-raised sm:h-48 sm:w-48"
              style={{ borderColor: `${GOLD}4D`, boxShadow: `0 0 30px -8px ${GOLD}40` }}
            >
              <img src={logo} alt="Dir Architects" className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 lg:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-blueprint" />
              <span className="font-mono text-xs text-ink-muted">Available for new projects</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Dir Architects
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted mt-1.5">
              Multidisciplinary Design Studio
            </p>
            <p className="label-eyebrow mt-3 min-h-[1.5em]" style={{ color: GOLD }}>
              {typedTagline}
              <span
                className="cursor-blink ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.15em] align-middle"
                style={{ backgroundColor: GOLD }}
              />
            </p>
            <p className="mt-5 max-w-xl text-ink-muted">
              Designing and visualizing buildings from first concept through construction —
              residential, commercial, and interior projects, presented the way clients
              actually experience them: in space, in light, in use.
            </p>
            <div className="mt-6">
              <p className="field-label mb-2">Focus areas</p>
              <ul className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border px-3 py-1.5 font-mono text-xs text-ink"
                    style={{ borderColor: `${GOLD}33` }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <p className="field-label mb-2">Software</p>
              <ul className="flex flex-wrap gap-2">
                {software.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line bg-bg px-3 py-1.5 font-mono text-xs text-blueprint"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToWork}
                className="inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-mono text-sm tracking-wide text-bg transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: GOLD, boxShadow: `0 0 24px -6px ${GOLD}80` }}
              >
                <ArrowDown size={16} /> View Projects
              </button>
              <Link to="/contact" className="btn-secondary">
                <MessageCircle size={16} /> Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}