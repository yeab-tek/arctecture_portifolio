import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { api } from '../../api/client'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    api
      .getAdminProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleDelete(project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    try {
      await api.deleteProject(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch {
      alert('Could not delete this project. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Projects</h1>
        <Link to="/admin/projects/new" className="btn-primary">
          <Plus size={16} /> New project
        </Link>
      </div>

      {loading && <p className="label-eyebrow">Loading…</p>}
      {error && <p className="text-accent">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-sm border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No projects yet. Add your first one to get the gallery started.
                  </td>
                </tr>
              )}
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{project.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{project.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${
                        project.status === 'published'
                          ? 'bg-blueprint/20 text-blueprint'
                          : 'bg-line text-ink-muted'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{project.year || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        className="text-ink-muted hover:text-blueprint"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(project)}
                        className="text-ink-muted hover:text-accent"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
