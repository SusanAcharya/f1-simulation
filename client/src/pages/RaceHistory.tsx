import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { raceAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

type RaceResult = {
  id: string
  date: string
  track: string
  winner: string
  participants: number
  yourPosition?: number
  points: number
}

export default function RaceHistory() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null)
  const [raceHistory, setRaceHistory] = useState<RaceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ wins: 0, podiums: 0, averagePosition: 0, totalPoints: 0, races: 0 })
  const { isAuthenticated, user } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch both race history and user profile stats
      Promise.all([
        raceAPI.getRaceHistory(),
        authAPI.getUserById(user.id)
      ])
        .then(([raceRes, profileRes]) => {
          setRaceHistory(raceRes.data || [])
          
          // Use backend-calculated stats from profile for consistency
          const profileStats = profileRes.data?.raceStats
          setStats({
            wins: profileStats?.wins || 0,
            podiums: profileStats?.podiums || 0,
            averagePosition: profileStats?.averagePosition || 0,
            totalPoints: profileStats?.totalPoints || 0,
            races: profileStats?.totalRaces || 0
          })
        })
        .catch(() => {
          setRaceHistory([])
          setStats({ wins: 0, podiums: 0, averagePosition: 0, totalPoints: 0, races: 0 })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const selectedRaceData = raceHistory.find(race => race.id === selectedRace)

  if (!isAuthenticated) {
    return (
      <div className="page container">
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#f5a623', marginBottom: '1rem' }}>Login Required</h2>
          <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>
            You need to be logged in to view your race history.
          </p>
          <motion.button 
            className="button-primary"
            onClick={() => window.location.href = '/login'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            Go to Login
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading race history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page container">
      <h1>📊 Race History</h1>
      
      {raceHistory.length === 0 ? (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏁</div>
          <h2 style={{ color: '#f5a623', marginBottom: '1rem' }}>No Races Yet</h2>
          <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>
            You haven't completed any races yet. Start racing to see your history here!
          </p>
          <motion.button 
            className="button-primary"
            onClick={() => window.location.href = '/live-race'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            Go to Live Race
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            {/* Race List */}
            <motion.div 
              className="card" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 style={{ color: '#f5a623', marginBottom: 16 }}>Recent Races</h3>
              
              <div style={{ display: 'grid', gap: 8 }}>
                {raceHistory.map((race, index) => (
                  <motion.div
                    key={race.id}
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedRace(race.id)}
                    style={{ 
                      padding: 12,
                      cursor: 'pointer',
                      background: selectedRace === race.id ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                      border: selectedRace === race.id ? '1px solid #00d4aa' : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 30, 
                        height: 30, 
                        background: race.yourPosition === 1 ? 'linear-gradient(45deg, #00ff88, #00d4aa)' :
                                                               race.yourPosition && race.yourPosition <= 3 ? 'linear-gradient(45deg, #f5a623, #ffb800)' : 
                               'linear-gradient(45deg, #e94560, #ff4757)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {race.yourPosition}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 'bold' }}>{race.track}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {new Date(race.date).toLocaleString()} • {race.participants} drivers
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#f5a623', fontWeight: 'bold' }}>
                          +{race.points} pts
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Race Details */}
            <motion.div 
              className="card" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 style={{ color: '#00d4aa', marginBottom: 16 }}>Race Details</h3>
              
              {selectedRaceData ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ 
                    padding: 12, 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Race Information</div>
                    <div style={{ display: 'grid', gap: 4, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="muted">Track:</span>
                        <span>{selectedRaceData.track}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="muted">Date:</span>
                        <span>{new Date(selectedRaceData.date).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="muted">Participants:</span>
                        <span>{selectedRaceData.participants}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="muted">Your Position:</span>
                        <span style={{ 
                          color: selectedRaceData.yourPosition === 1 ? '#00ff88' :
                                                           selectedRaceData.yourPosition && selectedRaceData.yourPosition <= 3 ? '#f5a623' : '#e94560',
                          fontWeight: 'bold'
                        }}>
                          {selectedRaceData.yourPosition}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="muted">Points Earned:</span>
                        <span style={{ color: '#f5a623', fontWeight: 'bold' }}>
                          +{selectedRaceData.points}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: 12, 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Winner</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 30, 
                        height: 30, 
                        background: 'linear-gradient(45deg, #00ff88, #00d4aa)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16
                      }}>
                        🏆
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#00ff88' }}>
                          {selectedRaceData.winner}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>1st Place</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 24, 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: 14
                }}>
                  Select a race to view details
                </div>
              )}
            </motion.div>
          </div>

          {/* Statistics Summary */}
          <motion.div 
            className="card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 16 }}
          >
            <h3 style={{ color: '#e94560' }}>Your Racing Stats</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div style={{ 
                padding: 12, 
                background: 'rgba(0, 255, 136, 0.1)', 
                borderRadius: 4,
                border: '1px solid #00ff88',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#00ff88' }}>{stats.wins}</div>
                <div className="muted" style={{ fontSize: 12 }}>Wins</div>
              </div>
              
              <div style={{ 
                padding: 12, 
                background: 'rgba(245, 166, 35, 0.1)', 
                borderRadius: 4,
                border: '1px solid #f5a623',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5a623' }}>{stats.podiums}</div>
                <div className="muted" style={{ fontSize: 12 }}>Podiums</div>
              </div>

              <div style={{ 
                padding: 12, 
                background: 'rgba(100, 149, 237, 0.12)', 
                borderRadius: 4,
                border: '1px solid rgba(100, 149, 237, 0.6)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: 'cornflowerblue' }}>{stats.averagePosition.toFixed(1)}</div>
                <div className="muted" style={{ fontSize: 12 }}>Avg Position</div>
              </div>
              
              <div style={{ 
                padding: 12, 
                background: 'rgba(0, 212, 170, 0.1)', 
                borderRadius: 4,
                border: '1px solid #00d4aa',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#00d4aa' }}>{stats.totalPoints}</div>
                <div className="muted" style={{ fontSize: 12 }}>Total Points</div>
              </div>
              
              <div style={{ 
                padding: 12, 
                background: 'rgba(233, 69, 96, 0.1)', 
                borderRadius: 4,
                border: '1px solid #e94560',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e94560' }}>{stats.races}</div>
                <div className="muted" style={{ fontSize: 12 }}>Races</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}