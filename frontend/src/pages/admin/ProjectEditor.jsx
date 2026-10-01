import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { api, resolveImageUrl } from '../../api/client'
import { createScope, animate, stagger } from 'animejs'

const emptyForm = {
  title: '',
  description: '',
  location: '',
  year: '',
  category_id: '',
  status: 'draft',
}

export default function ProjectEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const thumbGridRef = useRef(null)
  const animScope = useRef(null)

  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [addingFromUrl, setAddingFromUrl] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    api
      .getProject(id)
      .then((project) => {
        setForm({
          title: project.title,
          description: project.description || '',
          location: project.location || '',
          year: project.year || '',
          category_id: project.category?.id || '',
          status: project.status,
        })
        setImages(project.images)
      })
      .catch(() => setError('Could not load this project.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  useEffect(() => {
    if (images.length === 0) return
    animScope.current = createScope({ root: thumbGridRef }).add(() => {
      animate('.thumb', {
        scale: [0, 1],
        opacity: [0, 1],
        delay: stagger(80),
        duration: 500,
        ease: 'outElastic(1, .6)',
      })
    })
    return () => animScope.current?.revert()
  }, [images.length])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAddCategory() {
    const name = prompt('New category name (e.g. "Landscape")')
    if (!name) return
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      const category = await api.createCategory({ name, slug })
      setCategories((prev) => [...prev, category])
      update('category_id', category.id)
    } catch (err) {
      alert(err.message || 'Could not create category.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      category_id: form.category_id || null,
    }
    try {
      if (isNew) {
        const project = await api.createProject(payload)
        navigate(`/admin/projects/${project.id}`, { replace: true })
      } else {
        await api.updateProject(id, payload)
      }
    } catch (err) {
      setError(err.message || 'Could not save this project.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const image = await api.uploadImage(id, file)
        setImages((prev) => [...prev, image])
      }
    } catch (err) {
      alert(err.message || 'Could not upload one or more images.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleAddFromUrl(e) {
    e.preventDefault()
    if (!imageUrl.trim()) return
    setAddingFromUrl(true)
    try {
      const image = await api.addImageFromUrl(id, imageUrl.trim())
      setImages((prev) => [...prev, image])
      setImageUrl('')
    } catch (err) {
      alert(err.message || 'Could not add an image from that link.')
    } finally {
      setAddingFromUrl(false)
    }
  }

  async function handleSetCover(imageId) {
    try {
      await api.setCoverImage(imageId)
      setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === imageId })))
    } catch {
      alert('Could not set cover image.')
    }
  }

  async function handleDeleteImage(imageId) {
    if (!confirm('Remove this image?')) return
    try {
      await api.deleteImage(imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch {
      alert('Could not remove this image.')
    }
  }

  async function moveImage(index, direction) {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setImages(next)
    try {
      await api.reorderImages(
        id,
        next.map((img, i) => ({ id: img.id, sort_order: i }))
      )
    } catch {
      alert('Could not save the new image order.')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="label-eyebrow">Loading…</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Link to="/admin" className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-blueprint">
        <ArrowLeft size={14} /> All projects
      </Link>

      <h1 className="mb-8 font-display text-2xl font-semibold text-ink">
        {isNew ? 'New project' : 'Edit project'}
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div>
            <label className="field-label" htmlFor="title">Title</label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={8}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="field-input resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="location">Location</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="year">Year</label>
              <input
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
                className="field-input"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="field-label" htmlFor="category">Category</label>
            <div className="flex gap-2">
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className="field-input"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddCategory} className="btn-secondary px-3">+</button>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="field-input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="mt-1.5 font-mono text-xs text-ink-muted">
              Only published projects appear in the public gallery.
            </p>
          </div>

          {error && <p className="font-mono text-xs text-accent">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
          </button>
        </div>
      </form>

      {!isNew && (
        <div className="mt-12 border-t border-line pt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Images</h2>
            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleAddFromUrl} className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image link…"
                  className="field-input w-48"
                  disabled={addingFromUrl}
                />
                <button
                  type="submit"
                  disabled={addingFromUrl || !imageUrl.trim()}
                  className="btn-secondary shrink-0"
                >
                  {addingFromUrl ? 'Adding…' : 'Add from link'}
                </button>
              </form>
              <label className="btn-secondary cursor-pointer">
                <Upload size={14} /> {uploading ? 'Uploading…' : 'Add images'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {images.length === 0 ? (
            <p className="text-ink-muted">No images uploaded yet.</p>
          ) : (
            <div ref={thumbGridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, index) => (
                <div key={img.id} className="overflow-hidden rounded-sm border border-line bg-surface thumb">
                  <div className="relative aspect-[4/3]">
                    <img src={resolveImageUrl(img.url)} alt={img.caption || ''} className="h-full w-full object-cover" />
                    {img.is_cover && (
                      <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-bg">
                        Cover
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 py-2">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="text-ink-muted hover:text-blueprint disabled:opacity-30" aria-label="Move earlier">
                        <ChevronUp size={15} />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="text-ink-muted hover:text-blueprint disabled:opacity-30" aria-label="Move later">
                        <ChevronDown size={15} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSetCover(img.id)} className="text-ink-muted hover:text-accent" aria-label="Set as cover">
                        <Star size={15} fill={img.is_cover ? 'currentColor' : 'none'} />
                      </button>
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="text-ink-muted hover:text-accent" aria-label="Delete image">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}