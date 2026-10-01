import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api, resolveImageUrl } from '../api/client'
import ContactForm from '../components/ContactForm'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    setStatus('loading')
    api
      .getProject(id)
      .then((data) => {
        setProject(data)
        setActiveImage(0)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  if (status === 'loading') {
    return <p className="label-eyebrow py-24 text-center">Loading project…</p>
  }

  if (status === 'error' || !project) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="label-eyebrow mb-3">Project not found</p>
        <Link to="/" className="btn-secondary">Back to the gallery</Link>
      </div>
    )
  }

  const images = project.images.length > 0 ? project.images : [null]

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-blueprint">
        <ArrowLeft size={14} /> All projects
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-sm border border-line bg-surface">
            {images[activeImage] ? (
              <img
                src={resolveImageUrl(images[activeImage].url)}
                alt={images[activeImage].caption || project.title}
                className="w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-ink-muted">
                <span className="label-eyebrow">No images yet</span>
              </div>
            )}
          </div>

          {project.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {project.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-sm border transition-colors ${
                    i === activeImage ? 'border-accent' : 'border-line hover:border-blueprint'
                  }`}
                >
                  <img src={resolveImageUrl(img.url)} alt={img.caption || ''} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {project.category && <p className="label-eyebrow mb-2">{project.category.name}</p>}
          <h1 className="font-display text-3xl font-semibold text-ink">{project.title}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-5 font-mono text-xs">
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-muted">Location</dt>
              <dd className="mt-1 text-ink">{project.location || '—'}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-muted">Year</dt>
              <dd className="mt-1 text-ink">{project.year || '—'}</dd>
            </div>
          </dl>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-muted">
            {project.description || 'No description yet.'}
          </p>

          <div className="mt-10 rounded-sm border border-line bg-surface p-6">
            <p className="label-eyebrow mb-4">Interested in something similar?</p>
            <ContactForm projectId={project.id} projectTitle={project.title} />
          </div>
        </div>
      </div>
    </article>
  )
}