import { Link, NavLink } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
const navLinks = [
  { to: '/#work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Studio<span className="text-accent">.</span>Portfolio
        </Link>
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                  isActive ? 'text-blueprint' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-ink-muted/60 transition-colors hover:text-ink-muted"
            title="Admin"
          >
            <LockKeyhole size={13} />
          </Link>
        </nav>
      </div>
    </header>
  )
}