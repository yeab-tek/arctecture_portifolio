import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

/**
 * The site's signature scroll effect (REQ-ANIM-01/03/04): a line-drawn
 * house whose pieces - roof, chimney, walls, door - descend and lock
 * into place as the visitor scrolls through the hero section. Built
 * from plain SVG shapes driven by scroll progress, so it's cheap to
 * render and stays smooth on mid-range mobile devices.
 *
 * REQ-ANIM-02: if the visitor has "reduce motion" set, we skip the
 * scroll-linked transforms entirely and render the house fully
 * assembled and static - content and layout stay identical either way.
 */
export default function HouseAssembly() {
  const containerRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const groundDraw = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const wallsY = useTransform(scrollYProgress, [0.05, 0.35], [50, 0])
  const wallsOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1])
  const detailsOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1])
  const roofY = useTransform(scrollYProgress, [0.3, 0.65], [-170, 0])
  const roofRotate = useTransform(scrollYProgress, [0.3, 0.65], [-6, 0])
  const roofOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1])
  const chimneyY = useTransform(scrollYProgress, [0.5, 0.85], [-230, 0])
  const chimneyOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1])
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const headingY = useTransform(scrollYProgress, [0, 0.2], [16, 0])

  const staticProps = { y: 0, opacity: 1, rotate: 0, pathLength: 1 }

  return (
    <section ref={containerRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden bg-blueprint bg-blueprint bg-[length:32px_32px]">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 lg:flex-row lg:gap-16">
          <motion.div
            style={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: headingOpacity, y: headingY }}
            className="max-w-md text-center lg:text-left"
          >
            <p className="label-eyebrow mb-4">Completed Work, Assembled</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              Buildings that stay standing after the scaffolding comes down.
            </h1>
            <p className="mt-5 text-ink-muted">
              A record of finished projects — residential, commercial, and interiors —
              built with clients across the region.
            </p>
          </motion.div>

          <svg
            viewBox="0 0 400 400"
            className="h-[320px] w-[320px] shrink-0 sm:h-[380px] sm:w-[380px]"
            aria-hidden="true"
          >
            <motion.line
              x1="40" y1="340" x2="360" y2="340"
              stroke="#7FA8B3" strokeWidth="2"
              style={prefersReducedMotion ? staticProps : { pathLength: groundDraw }}
            />

            <motion.g style={prefersReducedMotion ? staticProps : { y: wallsY, opacity: wallsOpacity }}>
              <rect x="120" y="180" width="160" height="160" fill="#1E2126" stroke="#EDEAE3" strokeWidth="2" />
            </motion.g>

            <motion.g style={prefersReducedMotion ? staticProps : { opacity: detailsOpacity }}>
              <rect x="185" y="262" width="30" height="78" fill="none" stroke="#C1673B" strokeWidth="2" />
              <rect x="140" y="212" width="30" height="30" fill="none" stroke="#7FA8B3" strokeWidth="1.5" />
              <rect x="230" y="212" width="30" height="30" fill="none" stroke="#7FA8B3" strokeWidth="1.5" />
            </motion.g>

            <motion.g
              style={
                prefersReducedMotion
                  ? staticProps
                  : { y: roofY, opacity: roofOpacity, rotate: roofRotate }
              }
              transformOrigin="200px 180px"
            >
              <polygon points="95,182 200,90 305,182" fill="#15171B" stroke="#EDEAE3" strokeWidth="2" strokeLinejoin="round" />
            </motion.g>

            <motion.g style={prefersReducedMotion ? staticProps : { y: chimneyY, opacity: chimneyOpacity }}>
              <rect x="232" y="108" width="26" height="60" fill="#C1673B" stroke="#EDEAE3" strokeWidth="1.5" />
            </motion.g>
          </svg>
        </div>

        <p className="label-eyebrow pb-8 opacity-70">Scroll to build ↓</p>
      </div>
    </section>
  )
}
