import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { api } from '../../api/client'

const statusOptions = ['new', 'read', 'archived']

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getInquiries()
      .then(setInquiries)
      .catch(() => setError('Could not load inquiries.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(inquiry, status) {
    const previous = inquiries
    setInquiries((prev) => prev.map((i) => (i.id === inquiry.id ? { ...i, status } : i)))
    try {
      await api.updateInquiryStatus(inquiry.id, status)
    } catch {
      setInquiries(previous)
      alert('Could not update status. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-8 font-display text-2xl font-semibold text-ink">Inquiries</h1>

      {loading && <p className="label-eyebrow">Loading…</p>}
      {error && <p className="text-accent">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {inquiries.length === 0 && (
            <p className="text-ink-muted">No inquiries submitted yet.</p>
          )}
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-sm border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">{inquiry.name}</p>
                  <a href={`mailto:${inquiry.email}`} className="font-mono text-xs text-blueprint">
                    {inquiry.email}
                  </a>
                  <p className="mt-1 font-mono text-xs text-ink-muted">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusChange(inquiry, e.target.value)}
                  className="rounded-sm border border-line bg-bg px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mt-4 whitespace-pre-line text-ink-muted">{inquiry.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
