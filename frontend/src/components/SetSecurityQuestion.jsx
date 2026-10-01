import { useState } from 'react'
import { api } from '../api/client'

export default function SetSecurityQuestion() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setStatus('saving')
    try {
      await api.setSecurityQuestion(question, answer)
      setStatus('saved')
      setAnswer('')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setError(err.message || 'Could not save.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-surface p-6">
      <h2 className="mb-5 font-display text-lg font-semibold text-ink">Security question</h2>
      <p className="mb-4 text-sm text-ink-muted">
        Used to reset your password if you forget it. Saving a new question replaces the old one.
      </p>
      <div className="space-y-4">
        <div>
          <label className="field-label" htmlFor="sq-question">Security question</label>
          <input
            id="sq-question"
            type="text"
            placeholder="e.g. What year were you born?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="field-input"
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="sq-answer">Answer</label>
          <input
            id="sq-answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="field-input"
            required
          />
        </div>
        {error && <p className="font-mono text-xs text-accent">{error}</p>}
        {status === 'saved' && <p className="font-mono text-xs text-blueprint">Saved.</p>}
        <button type="submit" disabled={status === 'saving'} className="btn-primary">
          {status === 'saving' ? 'Saving…' : 'Save security question'}
        </button>
      </div>
    </form>
  )
}
