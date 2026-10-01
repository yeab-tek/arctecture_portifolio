import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogOut } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../api/client'
import SetSecurityQuestion from '../../components/SetSecurityQuestion'

function PasswordField({ id, label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="field-input pr-11"
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileStatus, setProfileStatus] = useState('idle')
  const [profileError, setProfileError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState('idle')
  const [passwordError, setPasswordError] = useState('')

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError('')
    try {
      await api.updateProfile({ name, email })
      await refreshUser()
      setProfileStatus('saved')
      setTimeout(() => setProfileStatus('idle'), 2000)
    } catch (err) {
      setProfileError(err.message || 'Could not save profile.')
      setProfileStatus('idle')
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setPasswordStatus('saving')
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordStatus('saved')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordStatus('idle'), 2000)
    } catch (err) {
      setPasswordError(err.status === 401 ? 'Current password is incorrect.' : err.message || 'Could not change password.')
      setPasswordStatus('idle')
    }
  }

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <AdminLayout>
      <h1 className="mb-8 font-display text-2xl font-semibold text-ink">Settings</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleProfileSubmit} className="rounded-sm border border-line bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
            </div>
            {profileError && <p className="font-mono text-xs text-accent">{profileError}</p>}
            {profileStatus === 'saved' && <p className="font-mono text-xs text-blueprint">Saved.</p>}
            <button type="submit" disabled={profileStatus === 'saving'} className="btn-primary">
              {profileStatus === 'saving' ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-sm border border-line bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink">Change password</h2>
          <div className="space-y-4">
            <PasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />
            {passwordError && <p className="font-mono text-xs text-accent">{passwordError}</p>}
            {passwordStatus === 'saved' && <p className="font-mono text-xs text-blueprint">Password updated.</p>}
            <button type="submit" disabled={passwordStatus === 'saving'} className="btn-primary">
              {passwordStatus === 'saving' ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <SetSecurityQuestion />
      </div>

      <div className="mt-8 rounded-sm border border-line bg-surface p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Session</h2>
        <p className="mb-4 text-sm text-ink-muted">Signed in as {user?.email}.</p>
        <button onClick={handleLogout} className="btn-secondary">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </AdminLayout>
  )
}
