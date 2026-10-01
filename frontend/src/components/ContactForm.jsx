import { useState } from 'react'
import { api } from '../api/client'

export default function ContactForm({ projectId = null, projectTitle = null }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await api.submitInquiry({ ...form, project_id: projectId })
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-sm border border-blueprint/40 bg-surface p-6">
        <p className="label-eyebrow mb-2">Message sent</p>
        <p className="text-ink">
          Thanks for reaching out{projectTitle ? ` about ${projectTitle}` : ''} — we'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {projectTitle && (
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-blueprint">
          Regarding: {projectTitle}
        </p>
      )}
      <div>
        <label className="field-label" htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          required
          maxLength={200}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="field-input"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="field-input"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="message">Message</label>
        <textarea
          id="message"
          required
          rows={5}
          maxLength={4000}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          className="field-input resize-none"
          placeholder="Tell us about your project…"
        />
      </div>
      {status === 'error' && (
        <p className="font-mono text-xs text-accent">{error}</p>
      )}
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full sm:w-auto">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
