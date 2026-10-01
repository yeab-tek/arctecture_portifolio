import ProjectCard from './ProjectCard'

/**
 * Pinterest-style masonry via CSS columns (REQ-GAL-01) - reflows cleanly
 * across breakpoints and needs no layout library, which keeps it
 * reliable across browsers.
 */
export default function MasonryGallery({ projects }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line py-24 text-center">
        <p className="label-eyebrow">No projects match this filter yet</p>
      </div>
    )
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
