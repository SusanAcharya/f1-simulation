import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { useAuth } from '../context/AuthContext'
import Countdown from '../components/Countdown'

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const profile = useGameStore(s => s.userProfile)
  const driver = useGameStore(s => s.driver)
  const car = useGameStore(s => s.car)
  const loading = useGameStore(s => s.loading)
  const error = useGameStore(s => s.error)
  const grantTokens = useGameStore(s => s.grantTokens)
  const loadUserData = useGameStore(s => s.loadUserData)

  useEffect(() => {
    if (isAuthenticated && !profile && !loading) {
      loadUserData()
    }
  }, [isAuthenticated, profile, loading, loadUserData])

  if (loading) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏁</div>
          <div>Loading your racing data...</div>
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
          <button 
            className="button-primary" 
            onClick={() => loadUserData()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container">
      <motion.h1 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(45deg, #f5a623, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}
      >
        🏁 Dashboard
      </motion.h1>
      <div className="grid-auto">
        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(0, 212, 170, 0.3)'
          }}
        >
          <div className="muted">Next Race</div>
          <Countdown />
        </motion.div>

        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(245, 166, 35, 0.3)'
          }}
        >
          <div className="muted">Tokens</div>
          <div style={{ 
            fontFamily: 'Bangers, cursive', 
            fontSize: '2.5rem', 
            color: '#f5a623',
            textShadow: '0 0 20px rgba(245, 166, 35, 0.5)',
            marginBottom: '0.5rem'
          }}>
            {profile?.tokens ?? 0}
          </div>
          <motion.button 
            className="button-secondary" 
            onClick={() => grantTokens(5)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: 8 }}
          >
            Collect +5
          </motion.button>
        </motion.div>

        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(0, 212, 170, 0.3)'
          }}
        >
          <div className="muted">Driver</div>
          <div style={{ 
            fontWeight: '800', 
            fontSize: '1.1rem',
            color: '#00d4aa',
            marginBottom: '0.5rem'
          }}>
            {driver?.name ?? '—'}
          </div>
          <div className="muted">Cornering {driver?.stats.cornering ?? 0} • Overtaking {driver?.stats.overtaking ?? 0}</div>
        </motion.div>

        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
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
          <div className="muted">Car</div>
          <div style={{ 
            fontWeight: '800', 
            fontSize: '1.1rem',
            color: '#e94560',
            marginBottom: '0.5rem'
          }}>
            {car?.name ?? '—'}
          </div>
          <div className="muted">Speed {car?.stats.speed ?? 0} • Accel {car?.stats.acceleration ?? 0}</div>
        </motion.div>

        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            y: -8,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(245, 166, 35, 0.3)'
          }}
        >
          <div className="muted">Facilities</div>
          <div>Training Lvl {profile?.facility.trainingLevel ?? 1} • Warehouse Lvl {profile?.facility.warehouseLevel ?? 1}</div>
        </motion.div>
      </div>
    </div>
  )
}


