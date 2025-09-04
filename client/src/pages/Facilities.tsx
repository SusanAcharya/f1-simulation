import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore, createDefaultState } from '../store/useGameStore'

export default function Facilities() {
  const userProfile = useGameStore(s => s.userProfile)
  const setUserProfile = useGameStore(s => s.setUserProfile)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    if (!userProfile) createDefaultState('demo-user')
  }, [userProfile])

  const doUpgrade = useGameStore(s => s.upgradeFacility)
  async function upgradeFacility(type: 'training' | 'warehouse') {
    if (!userProfile || upgrading) return
    setUpgrading(type)
    try {
      await doUpgrade(type)
    } finally {
      setUpgrading(null)
    }
  }

  if (!userProfile) return <div>Loading...</div>

  const trainingCost = userProfile.facility.trainingLevel * 10
  const warehouseCost = userProfile.facility.warehouseLevel * 10

  return (
    <div className="page container">
      <h1>🏗️ Facilities</h1>
      
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        {/* Training Facility */}
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
              🏋️
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#00d4aa' }}>Training Facility</h3>
              <div className="muted">Level {userProfile.facility.trainingLevel}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              Improves condition recovery and provides more driver stat points
            </div>
            <div style={{ fontSize: 12 }}>
              <div>• Condition Recovery: +{userProfile.facility.trainingLevel * 5}% per hour</div>
              <div>• Stat Points: +{userProfile.facility.trainingLevel} per race</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#f5a623' }}>Upgrade Cost:</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f5a623' }}>
                {trainingCost} tokens
              </div>
            </div>
            <button 
              className="button-primary"
              onClick={() => upgradeFacility('training')}
              disabled={userProfile.tokens < trainingCost || upgrading === 'training'}
              style={{ 
                opacity: userProfile.tokens < trainingCost ? 0.5 : 1,
                cursor: userProfile.tokens < trainingCost ? 'not-allowed' : 'pointer'
              }}
            >
              {upgrading === 'training' ? 'Upgrading...' : 'Upgrade'}
            </button>
          </div>
        </motion.div>

        {/* Warehouse */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          style={{ background: 'linear-gradient(135deg, #16213e, #0f3460)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              background: 'linear-gradient(45deg, #f5a623, #ffb800)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              🏭
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#f5a623' }}>Warehouse</h3>
              <div className="muted">Level {userProfile.facility.warehouseLevel}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              Provides more car stat points and reduces condition degradation
            </div>
            <div style={{ fontSize: 12 }}>
              <div>• Car Stat Points: +{userProfile.facility.warehouseLevel} per race</div>
              <div>• Condition Loss: -{userProfile.facility.warehouseLevel * 2}% per hour</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#f5a623' }}>Upgrade Cost:</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f5a623' }}>
                {warehouseCost} tokens
              </div>
            </div>
            <button 
              className="button-primary"
              onClick={() => upgradeFacility('warehouse')}
              disabled={userProfile.tokens < warehouseCost || upgrading === 'warehouse'}
              style={{ 
                opacity: userProfile.tokens < warehouseCost ? 0.5 : 1,
                cursor: userProfile.tokens < warehouseCost ? 'not-allowed' : 'pointer'
              }}
            >
              {upgrading === 'warehouse' ? 'Upgrading...' : 'Upgrade'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Token Balance */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: 16 }}
      >
        <h3 style={{ color: '#f5a623' }}>Token Balance</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'linear-gradient(45deg, #f5a623, #ffb800)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🪙
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5a623' }}>
              {userProfile.tokens} tokens
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              Earn tokens by racing and collecting rewards every 5 minutes
            </div>
          </div>
        </div>
      </motion.div>

      {/* Facility Benefits */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: 16 }}
      >
        <h3 style={{ color: '#00d4aa' }}>Facility Benefits</h3>
        <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
          <div style={{ padding: 8, background: 'rgba(0, 212, 170, 0.1)', borderRadius: 4 }}>
            <strong style={{ color: '#00d4aa' }}>Training Facility:</strong> Higher levels provide more driver stat points and faster condition recovery
          </div>
          <div style={{ padding: 8, background: 'rgba(245, 166, 35, 0.1)', borderRadius: 4 }}>
            <strong style={{ color: '#f5a623' }}>Warehouse:</strong> Higher levels provide more car stat points and reduce condition degradation
          </div>
        </div>
      </motion.div>
    </div>
  )
}
