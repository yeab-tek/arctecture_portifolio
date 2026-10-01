import { useState } from 'react'
import { api } from '../api/client'

export default function ForgotPassword({ onDone }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.getSecurityQuestion(email)
      setQuestion(data.question)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswerSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.verifySecurityAnswer(email, answer)
      setResetToken(data.reset_token)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    try {
      const data = await api.resetPassword(resetToken, newPassword)
      setSuccessMessage(data.detail)
      setStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="label-eyebrow mb-2">Admin area</p>
      <h1 className="font-display text-2xl font-semibold text-ink">Reset password</h1>

      <div className="mt-8 space-y-5">
        {error && <p className="font-mono text-xs text-accent">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="fp-email">Admin email</label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAnswerSubmit} className="space-y-5">
            <p className="font-mono text-xs text-ink-muted">{question}</p>
            <div>
              <label className="field-label" htmlFor="fp-answer">Your answer</label>
              <input
                id="fp-answer"
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="field-input"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="fp-new-password">New password</label>
              <input
                id="fp-new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="field-input"
                autoFocus
              />
            </div>
            <div>
              <label className="field-label" htmlFor="fp-confirm-password">Confirm new password</label>
              <input
                id="fp-confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <p className="font-mono text-xs text-ink-muted">{successMessage}</p>
            <button onClick={onDone} className="btn-primary w-full">
              Back to sign in
            </button>
          </div>
        )}

        {step !== 4 && (
          <button
            type="button"
            onClick={onDone}
            className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-blueprint"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  )
}
