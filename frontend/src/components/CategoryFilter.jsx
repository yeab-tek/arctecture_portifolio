export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
          active === null
            ? 'border-accent bg-accent text-bg'
            : 'border-line text-ink-muted hover:border-blueprint hover:text-ink'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.slug)}
          className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            active === cat.slug
              ? 'border-accent bg-accent text-bg'
              : 'border-line text-ink-muted hover:border-blueprint hover:text-ink'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
