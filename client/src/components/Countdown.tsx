import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getNextFiveMinuteTick(now: Date): number {
  const next = new Date(now)
  const minutes = now.getMinutes()
  const remainder = minutes % 5
  const add = remainder === 0 && now.getSeconds() === 0 ? 5 : (5 - remainder)
  next.setMinutes(minutes + add)
  next.setSeconds(0)
  next.setMilliseconds(0)
  return next.getTime()
}

export default function Countdown() {
  const [diff, setDiff] = useState<number>(() => getNextFiveMinuteTick(new Date()) - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const target = getNextFiveMinuteTick(new Date())
      setDiff(target - now)
    }, 250)
    return () => clearInterval(interval)
  }, [])

  const totalSeconds = Math.max(0, Math.floor(diff / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <motion.div 
        style={{ 
          fontFamily: 'Bangers, cursive', 
          fontSize: 36, 
          color: '#f5a623',
          textShadow: '0 0 20px rgba(245, 166, 35, 0.5)',
          filter: 'drop-shadow(0 0 10px rgba(245, 166, 35, 0.3))'
        }}
        animate={{ 
          scale: [1, 1.05, 1],
          filter: [
            'drop-shadow(0 0 10px rgba(245, 166, 35, 0.3))',
            'drop-shadow(0 0 20px rgba(245, 166, 35, 0.6))',
            'drop-shadow(0 0 10px rgba(245, 166, 35, 0.3))'
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.div>
      <motion.span 
        className="muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        until next race
      </motion.span>
    </div>
  )
}


