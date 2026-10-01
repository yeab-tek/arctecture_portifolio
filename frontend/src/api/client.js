/**
 * Small fetch wrapper. Centralising this means the base URL, JSON
 * handling, and 401-handling only need to be right in one place.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('admin_token')
}

// Image URLs from the backend are stored as relative paths (e.g. "/uploads/x.jpg").
// That only works when frontend and backend share an origin. In dev they don't
// (frontend on 5173, backend on 4000), so relative paths resolve against the
// wrong server and images break. This prefixes them with the actual API host.
function resolveImageUrl(url) {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `${API_URL}${url}`
}

async function request(path, { method = 'GET', body, isForm = false, auth = false } = {}) {
  const headers = {}
  if (!isForm) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`
    const error = new Error(typeof message === 'string' ? message : 'Request failed')
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  // Public
  getProjects: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/projects${qs ? `?${qs}` : ''}`)
  },
  getProject: (id) => request(`/api/projects/${id}`),
  getCategories: () => request('/api/categories'),
  submitInquiry: (payload) => request('/api/inquiries', { method: 'POST', body: payload }),

  // Auth
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),
  updateProfile: (payload) => request('/api/auth/me', { method: 'PATCH', body: payload, auth: true }),
  changePassword: (payload) =>
    request('/api/auth/change-password', { method: 'POST', body: payload, auth: true }),

  // Password reset
  getSecurityQuestion: (email) =>
    request('/api/auth/forgot-password/question', { method: 'POST', body: { email } }),
  verifySecurityAnswer: (email, answer) =>
    request('/api/auth/forgot-password/verify', { method: 'POST', body: { email, answer } }),
  resetPassword: (resetToken, newPassword) =>
    request('/api/auth/forgot-password/reset', {
      method: 'POST',
      body: { reset_token: resetToken, new_password: newPassword },
    }),
  setSecurityQuestion: (question, answer) =>
    request('/api/auth/forgot-password/set-security-question', {
      method: 'POST',
      body: { question, answer },
      auth: true,
    }),

  // Admin - projects
  getAdminProjects: () => request('/api/projects?include_drafts=true', { auth: true }),
  createProject: (payload) => request('/api/projects', { method: 'POST', body: payload, auth: true }),
  updateProject: (id, payload) =>
    request(`/api/projects/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE', auth: true }),
  createCategory: (payload) => request('/api/categories', { method: 'POST', body: payload, auth: true }),

  // Admin - images
  uploadImage: (projectId, file, caption = '') => {
    const form = new FormData()
    form.append('file', file)
    form.append('caption', caption)
    return request(`/api/projects/${projectId}/images`, { method: 'POST', body: form, isForm: true, auth: true })
  },
  addImageFromUrl: (projectId, url) =>
    request(`/api/projects/${projectId}/images/from-url`, { method: 'POST', body: { url }, auth: true }),
  addImageFromUrl: (projectId, url, caption = '') =>
    request(`/api/projects/${projectId}/images/from-url`, {
      method: 'POST',
      body: { url, caption },
      auth: true,
    }),
  reorderImages: (projectId, items) =>
    request(`/api/projects/${projectId}/images/reorder`, { method: 'PUT', body: { items }, auth: true }),
  setCoverImage: (imageId) => request(`/api/images/${imageId}/cover`, { method: 'PUT', auth: true }),
  deleteImage: (imageId) => request(`/api/images/${imageId}`, { method: 'DELETE', auth: true }),

  // Admin - inquiries
  getInquiries: () => request('/api/inquiries', { auth: true }),
  updateInquiryStatus: (id, status) =>
    request(`/api/inquiries/${id}`, { method: 'PATCH', body: { status }, auth: true }),
}

export { API_URL, getToken, resolveImageUrl }