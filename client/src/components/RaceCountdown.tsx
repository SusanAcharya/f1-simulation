import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

type RaceCountdownProps = {
  onCountdownComplete: () => void
  isActive: boolean
}

export default function RaceCountdown({ onCountdownComplete, isActive }: RaceCountdownProps) {
  const [countdown, setCountdown] = useState(3)
  const [showGo, setShowGo] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showReady, setShowReady] = useState(false)

  useEffect(() => {
    console.log('Countdown useEffect triggered, isActive:', isActive)
    
    if (!isActive) {
      setIsVisible(false)
      setCountdown(3)
      setShowGo(false)
      setShowReady(false)
      return
    }

    // Reset state when countdown becomes active
    setCountdown(3)
    setShowGo(false)
    setShowReady(false)
    setIsVisible(true)

    let countdownTimer: number | null = null

    // Show "READY" first
    setShowReady(true)
    console.log('Countdown started - showing READY')
    
    const readyTimer = setTimeout(() => {
      console.log('READY phase complete - starting countdown')
      setShowReady(false)
      
      // Start countdown after "READY" disappears
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          console.log('Countdown tick:', prev)
          if (prev > 1) {
            return prev - 1
          } else {
            console.log('Countdown complete - showing GO!')
            setShowGo(true)
            setTimeout(() => {
              console.log('GO! phase complete - hiding countdown')
              setIsVisible(false)
              // Small delay to ensure the countdown is fully hidden
              setTimeout(() => {
                console.log('Countdown complete - calling onCountdownComplete')
                onCountdownComplete()
              }, 100)
            }, 1200)
            return 0
          }
        })
      }, 1000)
    }, 1500)

    return () => {
      clearTimeout(readyTimer)
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
      // Cleanup state when effect is cleaned up
      setIsVisible(false)
      setCountdown(3)
      setShowGo(false)
      setShowReady(false)
    }
  }, [isActive, onCountdownComplete])

  if (!isActive || !isVisible) return null

  return (
    <div className="race-countdown-overlay">
      <AnimatePresence mode="wait">
        {showReady && (
          <motion.div
            key="ready"
            className="countdown-ready"
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            READY
          </motion.div>
        )}
        
        {countdown > 0 && !showGo && !showReady && (
          <motion.div
            key={countdown}
            className="countdown-number"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {countdown}
          </motion.div>
        )}
        
        {showGo && (
          <motion.div
            key="go"
            className="countdown-go"
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.span
              animate={{ 
                textShadow: [
                  "0 0 20px #00ff88",
                  "0 0 40px #00ff88",
                  "0 0 20px #00ff88"
                ]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              GO!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
