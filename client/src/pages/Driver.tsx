import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { useAuth } from '../context/AuthContext'
import type { Driver } from '../types/domain'

export default function Driver() {
  const { isAuthenticated } = useAuth()
  const driver = useGameStore(s => s.driver)
  const loading = useGameStore(s => s.loading)
  const error = useGameStore(s => s.error)
  const updateDriver = useGameStore(s => s.updateDriver)
  const loadUserData = useGameStore(s => s.loadUserData)

  const [pending, setPending] = useState<Partial<Driver['stats']>>({})
  const usedPoints = Object.values(pending).reduce((sum, v) => sum + (v || 0), 0)

  useEffect(() => {
    if (isAuthenticated && !driver && !loading) {
      loadUserData()
    }
  }, [isAuthenticated, driver, loading, loadUserData])

  async function upgradeStat(stat: keyof Driver['stats']) {
    if (!driver) return
    const remaining = driver.statPointsAvailable - usedPoints
    if (remaining <= 0) return
    const current = driver.stats[stat]
    const added = pending[stat] || 0
    if (current + added >= 100) return
    setPending(prev => ({ ...prev, [stat]: (prev[stat] || 0) + 1 }))
  }

  async function confirmUpgrades() {
    if (!driver || usedPoints <= 0) return
    const newStats = { ...driver.stats } as Driver['stats']
    for (const [k, v] of Object.entries(pending)) {
      const key = k as keyof Driver['stats']
      newStats[key] = Math.min(100, newStats[key] + (v || 0))
    }
    try {
      await updateDriver({ stats: newStats })
      setPending({})
    } catch (error) {
      console.error('Failed to confirm upgrades:', error)
    }
  }

  function cancelUpgrades() {
    setPending({})
  }

  async function renameDriver() {
    const newName = prompt('Enter new driver name:', driver?.name || '')
    if (newName && driver) {
      try {
        await updateDriver({ name: newName })
      } catch (error) {
        console.error('Failed to rename driver:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧑‍✈️</div>
          <div>Loading driver data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ color: '#e94560', marginBottom: '1rem' }}>{error}</div>
          <button className="button-primary" onClick={loadUserData}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧑‍✈️</div>
          <div>No driver data available</div>
        </div>
      </div>
    )
  }

  const statNames: Record<keyof Driver['stats'], string> = {
    cornering: 'Cornering',
    overtaking: 'Overtaking', 
    defending: 'Defending',
    aggression: 'Aggression',
    composure: 'Composure'
  }

  const statDescriptions: Record<keyof Driver['stats'], string> = {
    cornering: 'How well the driver handles turns',
    overtaking: 'Ability to pass other drivers',
    defending: 'Skill at blocking opponents',
    aggression: 'Willingness to take risks',
    composure: 'Staying calm under pressure'
  }

  return (
    <div className="page container">
      <h1>🧑‍✈️ Driver</h1>
      
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        {/* Driver Info Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          style={{ background: 'linear-gradient(135deg, #16213e, #0f3460)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              background: 'linear-gradient(45deg, #00d4aa, #00ff88)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              🏁
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#00d4aa' }}>{driver.name}</h3>
              <div className="muted">Racing Driver</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="button-secondary" onClick={renameDriver}>
              Rename
            </button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 style={{ color: '#f5a623', marginBottom: 16 }}>Driver Stats</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(driver.stats).map(([key, value]) => (
              <div key={key} style={{ 
                padding: 8, 
                background: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ minWidth: 100, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {statNames[key as keyof Driver['stats']]}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    height: 12, 
                    background: '#0f3460', 
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, (value as number) + (pending[key as keyof Driver['stats']] || 0))}%`,
                      height: '100%',
                      background: (value as number) >= 80 ? '#00ff88' : (value as number) >= 60 ? '#f5a623' : '#e94560',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ minWidth: 30, textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                    {(value as number) + (pending[key as keyof Driver['stats']] || 0)}
                  </div>
                  {driver.statPointsAvailable > 0 && (
                    <button 
                      className="button-primary"
                      onClick={() => upgradeStat(key as keyof Driver['stats'])}
                      style={{ padding: '2px 6px', fontSize: 10 }}
                    >
                      +
                    </button>
                  )}
                  {pending[key as keyof Driver['stats']] ? (
                    <span style={{ fontSize: 10, color: '#00d4aa', marginLeft: 6 }}>+{pending[key as keyof Driver['stats']]}</span>
                  ) : null}
                </div>
                <div className="muted" style={{ fontSize: 10 }}>
                  {statDescriptions[key as keyof Driver['stats']]}
                </div>
              </div>
            ))}
          </div>
          
          {(driver.statPointsAvailable > 0 || usedPoints > 0) && (
            <div style={{ 
              marginTop: 16, 
              padding: 8, 
              background: 'rgba(0, 212, 170, 0.1)', 
              borderRadius: 4,
              border: '1px solid #00d4aa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#00d4aa', fontSize: 12, fontWeight: 'bold' }}>
                  Available Points: {Math.max(0, driver.statPointsAvailable - usedPoints)} {usedPoints > 0 ? `(queued: ${usedPoints})` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button-secondary" onClick={cancelUpgrades} disabled={usedPoints === 0}>Cancel</button>
                  <button className="button-primary" onClick={confirmUpgrades} disabled={usedPoints === 0}>Confirm Upgrades</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Driver Tips */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: 16 }}
      >
        <h3 style={{ color: '#f5a623' }}>Driver Tips</h3>
        <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
          <div style={{ padding: 8, background: 'rgba(0, 212, 170, 0.1)', borderRadius: 4 }}>
            <strong style={{ color: '#00d4aa' }}>Cornering:</strong> Higher values help maintain speed through turns
          </div>
          <div style={{ padding: 8, background: 'rgba(245, 166, 35, 0.1)', borderRadius: 4 }}>
            <strong style={{ color: '#f5a623' }}>Overtaking:</strong> Essential for passing slower opponents
          </div>
          <div style={{ padding: 8, background: 'rgba(233, 69, 96, 0.1)', borderRadius: 4 }}>
            <strong style={{ color: '#e94560' }}>Aggression:</strong> High aggression can lead to risky but rewarding moves
          </div>
        </div>
      </motion.div>
    </div>
  )
}
