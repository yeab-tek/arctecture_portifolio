import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SceneReel from '../components/SceneReel'
import ArchitectProfile from '../components/ArchitectProfile'
import MasonryGallery from '../components/MasonryGallery'
import CategoryFilter from '../components/CategoryFilter'
import { heroScenes } from '../data/heroScenes'
import { api } from '../api/client'

export default function Home() {
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .getProjects(activeCategory ? { category: activeCategory } : {})
      .then(setProjects)
      .catch(() => setError('Could not load projects right now. Please try again shortly.'))
      .finally(() => setLoading(false))
  }, [activeCategory])

  // React Router's client-side navigation doesn't trigger the browser's
  // native "jump to #anchor" behavior, so the Navbar's "Work" link (which
  // goes to /#work) needs this to actually scroll the page.
  useEffect(() => {
    if (location.hash === '#work') {
      const el = document.getElementById('work')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location])

  return (
    <div>
      <SceneReel scenes={heroScenes} fit="contain" />
      <ArchitectProfile />

      <section id="work" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 sm:py-20">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-eyebrow mb-2">Selected Projects</p>
            <h2 className="font-display text-3xl font-semibold text-ink">The Work</h2>
          </div>
          {categories.length > 0 && (
            <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
          )}
        </div>

        {loading && (
          <p className="label-eyebrow py-10 text-center">Loading projects…</p>
        )}
        {error && <p className="py-10 text-center text-accent">{error}</p>}
        {!loading && !error && <MasonryGallery projects={projects} />}
      </section>
    </div>
  )
}