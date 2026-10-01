import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { resolveImageUrl } from '../api/client'

export default function ProjectCard({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-6 break-inside-avoid"
    >
      <Link
        to={`/projects/${project.id}`}
        className="group block overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-blueprint"
      >
        <div className="overflow-hidden bg-raised">
          {project.cover_image ? (
            <img
              src={resolveImageUrl(project.cover_image)}
              alt={project.title}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center text-ink-muted">
              <span className="label-eyebrow">No image yet</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {project.category && (
            <p className="label-eyebrow mb-1">{project.category.name}</p>
          )}
          <h3 className="font-display text-lg font-medium text-ink">{project.title}</h3>
          <p className="mt-1 font-mono text-xs text-ink-muted">
            {[project.location, project.year].filter(Boolean).join(' — ')}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}