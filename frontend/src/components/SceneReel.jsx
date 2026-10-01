import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFrameSequence } from '../hooks/useFrameSequence'

export default function SceneReel({ scenes, fit = 'contain', vhPerFrame = 7 }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const glowCanvasRef = useRef(null) // tiny offscreen canvas used to fake a cheap blur

  const allFrames = useMemo(() => scenes.flatMap((s) => s.frames), [scenes])
  const { images, loaded, progress } = useFrameSequence(allFrames)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const globalCaptions = useMemo(() => {
    const total = allFrames.length
    let cursor = 0
    const result = []
    for (const scene of scenes) {
      const sceneLen = scene.frames.length
      const sceneStart = cursor / total
      const sceneEnd = (cursor + sceneLen) / total
      for (const c of scene.captions || []) {
        result.push({
          at: sceneStart + c.at * (sceneEnd - sceneStart),
          title: c.title,
          subtitle: c.subtitle,
        })
      }
      cursor += sceneLen
    }
    return result.sort((a, b) => a.at - b.at)
  }, [scenes, allFrames.length])

  // Scene boundaries (as a 0-1 scroll ratio) so we can show "02 / 05" and
  // drive the side progress rail off the same scrollProgress used for frames.
  const sceneBoundaries = useMemo(() => {
    const total = allFrames.length
    let cursor = 0
    return scenes.map((scene) => {
      const start = cursor / total
      cursor += scene.frames.length
      return start
    })
  }, [scenes, allFrames.length])

  const activeSceneIndex = useMemo(() => {
    let idx = 0
    sceneBoundaries.forEach((start, i) => {
      if (scrollProgress >= start) idx = i
    })
    return idx
  }, [sceneBoundaries, scrollProgress])

  const heightVh = allFrames.length * vhPerFrame

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function getGlowCanvas() {
    if (!glowCanvasRef.current) {
      const c = document.createElement('canvas')
      c.width = 48
      c.height = 27
      glowCanvasRef.current = c
    }
    return glowCanvasRef.current
  }

  function drawFrame(index) {
    const canvas = canvasRef.current
    const img = images.current[index]
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // --- Ambient glow bleed ---
    // Draw the frame squashed into a tiny canvas, then stretch it back up.
    // The upscale itself produces a soft blur, so there's no per-frame
    // blur-filter cost on the full-size canvas.
    const glow = getGlowCanvas()
    const gctx = glow.getContext('2d')
    gctx.clearRect(0, 0, glow.width, glow.height)
    gctx.drawImage(img, 0, 0, glow.width, glow.height)

    ctx.save()
    ctx.filter = 'saturate(1.35) brightness(0.55)'
    ctx.globalAlpha = 0.9
    ctx.drawImage(glow, 0, 0, glow.width, glow.height, 0, 0, w, h)
    ctx.restore()

    // --- Sharp centered frame (unchanged contain/cover logic) ---
    const canvasRatio = w / h
    const imgRatio = img.naturalWidth / img.naturalHeight
    let drawW, drawH
    const shouldMatchHeight = fit === 'cover' ? imgRatio > canvasRatio : imgRatio <= canvasRatio
    if (shouldMatchHeight) {
      drawH = h
      drawW = h * imgRatio
    } else {
      drawW = w
      drawH = w / imgRatio
    }
    const offsetX = (w - drawW) / 2
    const offsetY = (h - drawH) / 2
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
  }

  useEffect(() => {
    if (!loaded) return
    if (reducedMotion) {
      drawFrame(allFrames.length - 1)
      setScrollProgress(1)
      return
    }
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const el = containerRef.current
        if (el) {
          const rect = el.getBoundingClientRect()
          const total = rect.height - window.innerHeight
          const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0))
          const progressRatio = total > 0 ? scrolled / total : 0
          const frameIndex = Math.min(
            allFrames.length - 1,
            Math.floor(progressRatio * allFrames.length)
          )
          drawFrame(frameIndex)
          setScrollProgress(progressRatio)
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, reducedMotion, allFrames.length])

  const activeCaption = useMemo(() => {
    if (globalCaptions.length === 0) return null
    let current = globalCaptions[0]
    for (const c of globalCaptions) {
      if (scrollProgress >= c.at) current = c
    }
    return current
  }, [globalCaptions, scrollProgress])

  return (
    <section ref={containerRef} style={{ height: `${heightVh}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-bg">
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Blueprint corner mark, top-left */}
        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted/60">
          <span className="h-px w-4 bg-current" />
          Studio Portfolio
        </div>

        {/* Architectural section/elevation rail, left side, vertically centered */}
        <div className="pointer-events-none absolute left-6 top-1/2 flex -translate-y-1/2 flex-col items-start md:left-10">
          <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted/50">
            Section A—A
          </span>
          <div className="relative h-80 w-px bg-ink-muted/20">
            {['+12.00', '+9.00', '+6.00', '+3.00', '\u00B10.00'].map((label, i) => (
              <div
                key={label}
                className="absolute left-0 flex items-center gap-2.5"
                style={{ top: `${(i / 4) * 100}%` }}
              >
                <span className="h-px w-3 bg-ink-muted/40" />
                <span className="whitespace-nowrap font-mono text-[11px] text-ink-muted/40">
                  {label}
                </span>
              </div>
            ))}
            {/* marker tracking scroll position down the section */}
            <div
              className="absolute -left-1 h-2.5 w-2.5 rounded-full bg-blueprint transition-[top] duration-300 ease-out"
              style={{ top: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted/40">
            Scale 1:100
          </span>
        </div>

        {/* Structural grid reference, right side, vertically centered - mirrors the
            left section rail's scale but uses the lettered-bubble convention from
            architectural floor plans (grid lines / column references) instead. */}
        <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-end md:right-10">
          <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted/50">
            Grid Ref
          </span>
          <div className="flex flex-col items-end gap-6">
            {scenes.map((_, i) => {
              const letter = String.fromCharCode(65 + i)
              const isActive = i === activeSceneIndex
              return (
                <div key={letter} className="flex items-center gap-3">
                  <span
                    className={`font-mono text-[11px] transition-colors duration-300 ${
                      isActive ? 'text-blueprint' : 'text-ink-muted/40'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[12px] transition-colors duration-300 ${
                      isActive
                        ? 'border-blueprint text-blueprint'
                        : 'border-ink-muted/30 text-ink-muted/40'
                    }`}
                  >
                    {letter}
                  </span>
                </div>
              )
            })}
          </div>
          <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted/40">
            Plan
          </span>
        </div>

        {globalCaptions.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/95 via-bg/20 to-transparent pb-14 pt-16">
            <div className="mx-auto max-w-6xl px-6">
              <AnimatePresence mode="wait">
                {activeCaption && (
                  <motion.div
                    key={activeCaption.title + activeCaption.subtitle}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="label-eyebrow mb-2">{activeCaption.title}</p>
                    {activeCaption.subtitle && (
                      <p className="font-display text-2xl font-semibold text-ink sm:text-4xl lg:text-5xl">
                        {activeCaption.subtitle}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {!loaded && (
          <p className="label-eyebrow absolute bottom-10">
            Loading sequence… {Math.round(progress * 100)}%
          </p>
        )}
      </div>
    </section>
  )
}