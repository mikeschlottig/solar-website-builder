"use client"

import { useEffect, useCallback, useState } from "react"

interface ExitIntentOptions {
  threshold?: number
  delay?: number
  cookieExpire?: number
  aggressive?: boolean
  onExitIntent?: () => void
}

export function useExitIntent(options: ExitIntentOptions = {}) {
  const { threshold = 20, delay = 1000, cookieExpire = 1, aggressive = false, onExitIntent } = options

  const [hasTriggered, setHasTriggered] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  // Check if exit intent has been shown before
  const checkCookie = useCallback(() => {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith("exitIntentShown="))
    return cookie ? cookie.split("=")[1] === "true" : false
  }, [])

  // Set cookie to prevent showing again
  const setCookie = useCallback(() => {
    const expires = new Date()
    expires.setTime(expires.getTime() + cookieExpire * 24 * 60 * 60 * 1000)
    document.cookie = `exitIntentShown=true; expires=${expires.toUTCString()}; path=/`
  }, [cookieExpire])

  // Handle mouse leave event
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (hasTriggered || !isEnabled) return

      // Check if mouse is moving toward the top of the page (likely to close tab)
      if (e.clientY <= threshold && e.movementY < 0) {
        setHasTriggered(true)
        setCookie()
        onExitIntent?.()
      }
    },
    [hasTriggered, isEnabled, threshold, onExitIntent, setCookie],
  )

  // Handle mobile touch events (less reliable but still useful)
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (hasTriggered || !isEnabled) return

      // On mobile, trigger on swipe up gesture near top of screen
      const touch = e.touches[0]
      if (touch.clientY <= threshold * 2) {
        setHasTriggered(true)
        setCookie()
        onExitIntent?.()
      }
    },
    [hasTriggered, isEnabled, threshold, onExitIntent, setCookie],
  )

  // Handle page visibility change (when user switches tabs)
  const handleVisibilityChange = useCallback(() => {
    if (hasTriggered || !isEnabled) return

    if (document.hidden && aggressive) {
      setHasTriggered(true)
      setCookie()
      onExitIntent?.()
    }
  }, [hasTriggered, isEnabled, aggressive, onExitIntent, setCookie])

  // Handle beforeunload event (when user tries to close/refresh page)
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasTriggered || !isEnabled) return

      if (aggressive) {
        setHasTriggered(true)
        setCookie()
        onExitIntent?.()

        // Show browser's default confirmation dialog
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    },
    [hasTriggered, isEnabled, aggressive, onExitIntent, setCookie],
  )

  useEffect(() => {
    // Don't enable if already shown before
    if (checkCookie()) {
      return
    }

    // Enable after delay
    const timer = setTimeout(() => {
      setIsEnabled(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, checkCookie])

  useEffect(() => {
    if (!isEnabled) return

    // Add event listeners
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isEnabled, handleMouseLeave, handleTouchStart, handleVisibilityChange, handleBeforeUnload])

  const reset = useCallback(() => {
    setHasTriggered(false)
    // Clear cookie
    document.cookie = "exitIntentShown=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  }, [])

  const trigger = useCallback(() => {
    if (!hasTriggered) {
      setHasTriggered(true)
      setCookie()
      onExitIntent?.()
    }
  }, [hasTriggered, onExitIntent, setCookie])

  return {
    hasTriggered,
    isEnabled,
    reset,
    trigger,
  }
}
