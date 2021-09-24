import { useState, useEffect, useMemo } from 'react'

export const useDimensions = () => {
  const [dimensions, setDimensions] = useState()

  useEffect(() => {
    let timeoutId = null
    const resizeListener = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setDimensions({ width: window.innerWidth, height: window.innerHeight }), 150)
    }
    window.addEventListener('resize', resizeListener)

    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [])

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  const isMobile = useMemo(() => {
    return dimensions?.width <= 500
  }, [dimensions])

  return { dimensions, isMobile }
}
