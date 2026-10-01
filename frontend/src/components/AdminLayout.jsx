import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/admin', label: 'Projects', end: true },
  { to: '/admin/inquiries', label: 'Inquiries', end: false },
  { to: '/admin/settings', label: 'Settings', end: false },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-display text-sm font-semibold tracking-tight text-ink"
            >
              Studio<span className="text-accent">.</span>Portfolio
            </Link>
            <nav className="flex items-center gap-6">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `font-mono text-xs uppercase tracking-[0.12em] ${
                      isActive ? 'text-blueprint' : 'text-ink-muted hover:text-ink'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-ink-muted">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink-muted hover:text-accent"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}