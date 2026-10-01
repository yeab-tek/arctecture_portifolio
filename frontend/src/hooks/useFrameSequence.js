import { useEffect, useRef, useState } from 'react'

export function useFrameSequence(frameUrls) {
  const imagesRef = useRef([])
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let loadedCount = 0
    setLoaded(false)
    setProgress(0)

    const images = frameUrls.map((url) => {
      const img = new Image()
      img.src = url
      img.onload = img.onerror = () => {
        if (cancelled) return
        loadedCount += 1
        setProgress(loadedCount / frameUrls.length)
        if (loadedCount === frameUrls.length) setLoaded(true)
      }
      return img
    })
    imagesRef.current = images

    return () => {
      cancelled = true
    }
  }, [frameUrls])

  return { images: imagesRef, loaded, progress }
}
