import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { useAuth } from '../context/AuthContext'
import type { Car } from '../types/domain'

export default function Garage() {
  const { isAuthenticated } = useAuth()
  const car = useGameStore(s => s.car)
  const loading = useGameStore(s => s.loading)
  const error = useGameStore(s => s.error)
  const updateCar = useGameStore(s => s.updateCar)
  const loadUserData = useGameStore(s => s.loadUserData)

  const [pending, setPending] = useState<Partial<Car['stats']>>({})
  const usedPoints = Object.values(pending).reduce((sum, v) => sum + (v || 0), 0)


  useEffect(() => {
    if (isAuthenticated && !car && !loading) {
      loadUserData()
    }
  }, [isAuthenticated, car, loading, loadUserData])

  function queueUpgrade(stat: keyof Car['stats']) {
    if (!car) return
    const remaining = car.statPointsAvailable - usedPoints
    if (remaining <= 0) return
    const current = car.stats[stat]
    const added = pending[stat] || 0
    if (current + added >= 100) return
    setPending(prev => ({ ...prev, [stat]: (prev[stat] || 0) + 1 }))
  }

  async function confirmUpgrades() {
    if (!car || usedPoints <= 0) return
    const newStats = { ...car.stats } as Car['stats']
    for (const [k, v] of Object.entries(pending)) {
      const key = k as keyof Car['stats']
      newStats[key] = Math.min(100, newStats[key] + (v || 0))
    }
    try {
      await updateCar({ stats: newStats })
      setPending({})
    } catch {}
  }

  function cancelUpgrades() {
    setPending({})
  }

  async function renameCar() {
    const newName = prompt('Enter new car name:', car?.name || '')
    if (newName && car) {
      try { await updateCar({ name: newName }) } catch {}
    }
  }

  if (loading && !car) return <div>Loading...</div>
  if (error) return <div className="page container">{error}</div>
  if (!car) return <div>No car data available</div>

  const statNames: Record<keyof Car['stats'], string> = {
    speed: 'Speed',
    acceleration: 'Acceleration', 
    braking: 'Braking',
    aero: 'Aerodynamics',
    fuel: 'Fuel Eff',
    tireWear: 'Tire Wear',
    grip: 'Grip',
    durability: 'Durability'
  }

  return (
    <div className="page container">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(45deg, #e94560, #f5a623)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}
      >
        🏎️ Garage
      </motion.h1>
      
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        {/* Car Info Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(233, 69, 96, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <motion.div 
              style={{ 
                width: 60, 
                height: 40, 
                background: 'linear-gradient(45deg, #e94560, #f5a623)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                filter: 'drop-shadow(0 0 10px rgba(233, 69, 96, 0.5))'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              🏎️
            </motion.div>
            <div>
              <h3 style={{ margin: 0, color: '#f5a623' }}>{car.name}</h3>
              <div className="muted">Condition: {car.condition}%</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <motion.button 
              className="button-secondary" 
              onClick={renameCar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Rename
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <h3 style={{ color: '#00d4aa', marginBottom: 16 }}>Car Stats</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(car.stats).map(([key, value], index) => (
              <motion.div 
                key={key} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ minWidth: 100, fontSize: 12, textTransform: 'uppercase' }}>
                  {statNames[key as keyof Car['stats']]}
                </div>
                <div style={{ 
                  flex: 1, 
                  height: 16, 
                  background: '#0f3460', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <motion.div 
                    style={{
                      width: `${Math.min(100, (value as number) + (pending[key as keyof Car['stats']] || 0))}%`,
                      height: '100%',
                      background: (value as number) >= 80 ? '#00ff88' : (value as number) >= 60 ? '#f5a623' : '#e94560',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (value as number) + (pending[key as keyof Car['stats']] || 0))}%` }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div style={{ minWidth: 30, textAlign: 'right', fontSize: 12 }}>
                  {(value as number) + (pending[key as keyof Car['stats']] || 0)}
                </div>
                {car.statPointsAvailable - usedPoints > 0 && (
                  <motion.button 
                    className="button-primary"
                    onClick={() => queueUpgrade(key as keyof Car['stats'])}
                    style={{ padding: '4px 8px', fontSize: 10 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                )}
                {pending[key as keyof Car['stats']] ? (
                  <span style={{ fontSize: 10, color: '#00d4aa', marginLeft: 6 }}>+{pending[key as keyof Car['stats']]}</span>
                ) : null}
              </motion.div>
            ))}
          </div>
          
          {(car.statPointsAvailable > 0 || usedPoints > 0) && (
            <motion.div 
              style={{ 
                marginTop: 16, 
                padding: 8, 
                background: 'rgba(0, 212, 170, 0.1)', 
                borderRadius: 4,
                border: '1px solid #00d4aa'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#00d4aa', fontSize: 12 }}>
                  Available Points: {Math.max(0, car.statPointsAvailable - usedPoints)} {usedPoints > 0 ? `(queued: ${usedPoints})` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button 
                    className="button-secondary"
                    onClick={cancelUpgrades}
                    disabled={usedPoints === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    className="button-primary"
                    onClick={confirmUpgrades}
                    disabled={usedPoints === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm Upgrades
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Condition Bar */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ 
          scale: 1.01, 
          y: -4,
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
        }}
        style={{ marginTop: 16 }}
      >
        <h3 style={{ color: '#f5a623' }}>Car Condition</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            flex: 1, 
            height: 20, 
            background: '#0f3460', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <motion.div 
              style={{
                width: `${car.condition}%`,
                height: '100%',
                background: car.condition >= 80 ? '#00ff88' : 
                           car.condition >= 60 ? '#f5a623' : 
                           car.condition >= 40 ? '#ffb800' : '#e94560',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${car.condition}%` }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
            />
          </div>
          <div style={{ minWidth: 40, textAlign: 'right', fontWeight: 'bold' }}>
            {car.condition}%
          </div>
        </div>
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Car condition degrades 5% per hour. Keep it maintained for optimal performance!
        </div>
        
        {/* Boost Condition Button */}
        {car.condition < 100 && (
          <motion.button
            className="button-primary"
            onClick={() => {
              const tokens = 10
              const boostAmount = Math.min(10, 100 - car.condition)
              if (confirm(`Boost car condition by ${boostAmount}% for ${tokens} tokens?`)) {
                useGameStore.getState().boostCarCondition(tokens)
              }
            }}
            style={{ marginTop: 12, width: '100%' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Boost Condition (+10% for 10 tokens)
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
