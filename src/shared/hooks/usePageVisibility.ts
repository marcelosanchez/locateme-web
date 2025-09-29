import { useState, useEffect } from 'react'

interface UsePageVisibilityReturn {
  isVisible: boolean
  visibilityState: DocumentVisibilityState
  isBackground: boolean
  timeInBackground: number
}

export function usePageVisibility(): UsePageVisibilityReturn {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const [visibilityState, setVisibilityState] = useState(document.visibilityState)
  const [backgroundStartTime, setBackgroundStartTime] = useState<number | null>(null)
  const [timeInBackground, setTimeInBackground] = useState(0)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newIsVisible = !document.hidden
      const newVisibilityState = document.visibilityState
      
      setIsVisible(newIsVisible)
      setVisibilityState(newVisibilityState)
      
      if (newIsVisible) {
        // Page became visible
        if (backgroundStartTime) {
          const timeSpent = Date.now() - backgroundStartTime
          setTimeInBackground(timeSpent)
          setBackgroundStartTime(null)
        }
      } else {
        // Page became hidden
        setBackgroundStartTime(Date.now())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also listen for focus/blur events as fallback
    const handleFocus = () => setIsVisible(true)
    const handleBlur = () => setIsVisible(false)
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [backgroundStartTime])

  return {
    isVisible,
    visibilityState,
    isBackground: !isVisible,
    timeInBackground
  }
}