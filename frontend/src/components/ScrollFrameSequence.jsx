import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFrameSequence } from '../hooks/useFrameSequence'

export default function ScrollFrameSequence({
  frameUrls,
  heightVh = 300,
  fit = 'cover',
  captions = null,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { images, loaded, progress } = useFrameSequence(frameUrls)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
  }

  useEffect(() => {
    if (!loaded) return

    if (reducedMotion) {
      drawFrame(frameUrls.length - 1)
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
            frameUrls.length - 1,
            Math.floor(progressRatio * frameUrls.length)
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
  }, [loaded, reducedMotion, frameUrls.length])

  const activeCaption = useMemo(() => {
    if (!captions || captions.length === 0) return null
    let current = captions[0]
    for (const c of captions) {
      if (scrollProgress >= c.at) current = c
    }
    return current
  }, [captions, scrollProgress])

  return (
    <section ref={containerRef} style={{ height: `${heightVh}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-bg">
        <canvas ref={canvasRef} className="h-full w-full" />

        {captions && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent pb-14 pt-24">
            <div className="mx-auto max-w-6xl px-6">
              <AnimatePresence mode="wait">
                {activeCaption && (
                  <motion.div
                    key={activeCaption.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <p className="label-eyebrow mb-2">{activeCaption.title}</p>
                    {activeCaption.subtitle && (
                      <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
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