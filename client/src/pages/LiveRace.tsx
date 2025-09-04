import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useGameStore } from '../store/useGameStore'
import { raceAPI } from '../services/api'
import { useGlobalRace } from '../hooks/useGlobalRace'
import RaceHistory from '../components/RaceHistory'

import RaceCountdown from '../components/RaceCountdown'

export default function LiveRace() {
  const { isAuthenticated } = useAuth()
  const { userProfile } = useGameStore()
  const [currentRace, setCurrentRace] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live')
  const { raceState, startRace, resetRace, initializeRace } = useGlobalRace()

  // Load current race
  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentRace()
    }
  }, [isAuthenticated])



  const loadCurrentRace = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to get demo race first for better experience
      let response
      try {
        response = await raceAPI.getDemoRace()
      } catch {
        // Fallback to current race if demo fails
        response = await raceAPI.getCurrentRace()
      }
      
      const race = response.data
      setCurrentRace(race)
      
      // Update current user's profile and car pictures if they exist in the race
      if (race.participants && race.participants.length > 0 && userProfile) {
        const userProfilePic = localStorage.getItem('userProfilePic') || '1'
        const userCarPic = localStorage.getItem('userCarPic') || '1'
        
        // Find and update current user's data in the race participants
        const currentUserIndex = race.participants.findIndex((p: any) => p.userId === userProfile.id)
        if (currentUserIndex !== -1) {
          race.participants[currentUserIndex].profilePic = `/src/assets/profile-pics/profile-pic${userProfilePic}.png`
          race.participants[currentUserIndex].carPic = `/src/assets/cars/racecar${userCarPic}.png`
        }
      }
      
      // Initialize race simulation using global service
      await initializeRace(race, race.participants)
    } catch (error: any) {
      setError(error.message || 'Failed to load current race')
    } finally {
      setLoading(false)
    }
  }





  const handleStartRace = () => {
    console.log('Starting race...')
    setShowCountdown(true)
    // Don't call startRace() here - let the countdown handle it
  }

  const onCountdownComplete = () => {
    console.log('Countdown completed - starting race simulation')
    setShowCountdown(false)
    // Start the race simulation immediately after countdown
    startRace()
  }

  const handleResetRace = () => {
    setShowCountdown(false)
    resetRace()
    
    // Reinitialize with current race data
    if (currentRace) {
      initializeRace(currentRace, currentRace.participants)
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏁</div>
          <div>Loading race data...</div>
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
          <button className="button-primary" onClick={loadCurrentRace}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!raceState) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏁</div>
          <div>No race data available</div>
        </div>
      </div>
    )
  }

  // Show empty state if no participants
  if (!raceState.participants || raceState.participants.length === 0) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏁</div>
          <h2>No Racers Available</h2>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            No users are registered yet. Be the first to join the racing community!
          </p>
          <button 
            className="button-primary" 
            onClick={() => window.location.href = '/login'}
          >
            🚀 Join the Race
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container live-race-container">
      <h1>🏁 Live Race</h1>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #333'
      }}>
        <button
          className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'live' ? '#00d4aa' : 'transparent',
            color: activeTab === 'live' ? '#000' : '#00d4aa',
            border: '2px solid #00d4aa',
            borderRadius: '8px 8px 0 0',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🏁 Live Race
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'history' ? '#f5a623' : 'transparent',
            color: activeTab === 'history' ? '#000' : '#f5a623',
            border: '2px solid #f5a623',
            borderRadius: '8px 8px 0 0',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Race History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' ? (
        <RaceHistory />
      ) : (
        <>
      
      {/* Race Controls */}
      <motion.div 
        className="race-controls" 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="race-status">
          <div className="status-info">
            <h4 style={{ color: '#00d4aa' }}>
              {raceState.status === 'waiting' ? 'Ready to Race' : 
               raceState.status === 'countdown' ? 'Race Starting...' :
               raceState.status === 'racing' ? 'Race in Progress' : 'Race Finished'}
            </h4>
            <div className="status-details">
              <span className="lap-info">Lap {raceState.currentLap} of {raceState.totalLaps}</span>
              <span className="participant-count">{raceState.participants.length} Drivers</span>
            </div>
          </div>
          
          <div className="race-actions">
            {raceState.status === 'waiting' && (
              <button 
                className="button-primary" 
                onClick={handleStartRace}
              >
                🏁 Start Race
              </button>
            )}
            {raceState.status === 'racing' && (
              <div style={{ color: '#00ff88', fontSize: 16, fontWeight: 'bold' }}>
                🏁 RACE IN PROGRESS
              </div>
            )}
            {raceState.status === 'finished' && (
              <button 
                className="button-secondary" 
                onClick={handleResetRace}
              >
                🔄 New Race
              </button>
            )}
          </div>
        </div>
      </motion.div>



      {/* Podium Display - Show when race is finished */}
      {raceState.status === 'finished' && (
        <motion.div 
          className="podium-display" 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#f5a623' }}>
            🏆 Race Podium 🏆
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'end', 
            gap: '2rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            border: '2px solid rgba(245, 166, 35, 0.3)'
          }}>
            {/* 2nd Place */}
            {raceState.participants.find(p => p.position === 2) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)',
                  borderRadius: '8px',
                  border: '2px solid #c0c0c0',
                  boxShadow: '0 0 20px rgba(192, 192, 192, 0.5)',
                  minWidth: '120px'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                  border: '3px solid #c0c0c0'
                }}>
                  <img 
                    src={raceState.participants.find(p => p.position === 2)?.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                    alt="2nd Place"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                  {raceState.participants.find(p => p.position === 2)?.username}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>2nd Place</div>
              </motion.div>
            )}
            
            {/* 1st Place */}
            {raceState.participants.find(p => p.position === 1) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                  borderRadius: '8px',
                  border: '2px solid #ffd700',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.7)',
                  minWidth: '140px',
                  transform: 'translateY(-20px)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥇</div>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                  border: '4px solid #ffd700'
                }}>
                  <img 
                    src={raceState.participants.find(p => p.position === 1)?.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                    alt="1st Place"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                  {raceState.participants.find(p => p.position === 1)?.username}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>1st Place</div>
              </motion.div>
            )}
            
            {/* 3rd Place */}
            {raceState.participants.find(p => p.position === 3) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #cd7f32, #b8860b)',
                  borderRadius: '8px',
                  border: '2px solid #cd7f32',
                  boxShadow: '0 0 20px rgba(205, 127, 50, 0.5)',
                  minWidth: '120px'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                  border: '3px solid #cd7f32'
                }}>
                  <img 
                    src={raceState.participants.find(p => p.position === 3)?.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                    alt="3rd Place"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                  {raceState.participants.find(p => p.position === 3)?.username}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>3rd Place</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Live Leaderboard - Show during racing */}
      {(raceState.status === 'racing' || raceState.status === 'finished') && (
        <motion.div 
          className="live-leaderboard" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>🏆 Live Leaderboard</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Driver</th>
                  <th>Lap Progress</th>
                  <th>Current/Best</th>
                  <th>Gap</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {raceState.participants
                  .sort((a, b) => a.position - b.position)
                  .map((participant, index) => {
                    const isCurrentUser = userProfile && participant.userId === userProfile.id
                    const rowClass = [
                      isCurrentUser ? 'current-user' : '',
                      participant.dnf ? 'dnf' : (participant.retired ? 'retired' : ''),
                      participant.position === 1 ? 'gold' :
                      participant.position === 2 ? 'silver' :
                      participant.position === 3 ? 'bronze' : ''
                    ].filter(Boolean).join(' ')
                    return (
                    <motion.tr
                      key={participant.id}
                      className={rowClass}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                    <td className={`position ${
                      raceState.status === 'finished' ? (
                        participant.position === 1 ? 'leader' :
                        participant.position === 2 ? 'second' :
                        participant.position === 3 ? 'third' : 'other'
                      ) : (
                        participant.position === 1 ? 'leader' :
                        participant.position <= 3 ? 'podium' : 'other'
                      )
                    }`}>
                      {participant.retired ? 'RET' : participant.position}
                    </td>
                    
                    <td className="driver-info">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="driver-avatar">
                          <img 
                            src={participant.profilePic || `/src/assets/profile-pics/profile-pic1.png`} 
                            alt={participant.username}
                            onError={(e) => {
                              e.currentTarget.src = '/src/assets/profile-pics/profile-pic1.png'
                            }}
                          />
                        </div>
                        <div style={{ marginLeft: 10, width: 48, height: 30, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <img
                            src={typeof participant.carPic === 'number' 
                              ? `/src/assets/cars/racecar${participant.carPic}.png`
                              : (participant.carPic || `/src/assets/cars/racecar1.png`) }
                            alt={`${participant.username} car`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = '/src/assets/cars/racecar1.png'
                            }}
                          />
                        </div>
                        <div className="driver-details">
                          <div className="driver-name">
                            {participant.username}
                            {isCurrentUser && <span className="current-user-badge">YOU</span>}
                          </div>
                          <div className="driver-stats">
                            {participant.driver.name} • {participant.car.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '20px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${Math.max(0, Math.min(100, participant.lapProgress))}%`,
                          height: '100%',
                          background: participant.retired ? '#e94560' : 
                                     participant.position === 1 ? 'linear-gradient(90deg, #ffd700, #ffed4e)' :
                                     participant.position === 2 ? 'linear-gradient(90deg, #c0c0c0, #a8a8a8)' :
                                     participant.position === 3 ? 'linear-gradient(90deg, #cd7f32, #b8860b)' :
                                     'linear-gradient(90deg, #00d4aa, #00ff88)',
                          transition: 'width 0.3s ease',
                          borderRadius: '10px'
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#fff',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}>
                          {participant.lapProgress.toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#888', 
                        marginTop: '2px',
                        textAlign: 'center'
                      }}>
                        Lap {participant.currentLap}/{raceState.totalLaps}
                      </div>
                    </td>
                    
                    <td style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
                        <div style={{ 
                          color: '#00d4aa', 
                          fontWeight: 'bold',
                          marginBottom: '2px'
                        }}>
                          {participant.lapTime}
                        </div>
                        <div style={{ 
                          color: '#f5a623', 
                          fontSize: '10px',
                          opacity: 0.8
                        }}>
                          {participant.bestLap}
                        </div>
                      </div>
                    </td>
                    
                    <td className="gap">
                      {participant.gap}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {(Math.max(0, Math.min(100, participant.car?.condition ?? 0))).toFixed(1)}%
                    </td>
                    
                    <td className={`status ${participant.retired ? 'retired' : 'running'}`}>
                      {raceState.status === 'finished' ? (
                        participant.dnf ? (
                          <span style={{ color: '#e94560', fontWeight: 'bold' }}>DNF</span>
                        ) : (
                          <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
                            <div style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                              +{participant.earnedPoints || 0} pts
                            </div>
                            <div style={{ color: '#f5a623', fontWeight: 'bold' }}>
                              +{participant.earnedTokens || 0} tokens
                            </div>
                          </div>
                        )
                      ) : (
                        participant.retired ? 'RETIRED' : 'RUNNING'
                      )}
                    </td>
                    </motion.tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Race Info - Show when not racing */}
      {raceState.status === 'waiting' && (
        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 16 }}
        >
          <h3 style={{ color: '#00d4aa' }}>Race Information</h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ padding: 8, background: 'rgba(0, 212, 170, 0.1)', borderRadius: 4 }}>
              <strong style={{ color: '#00d4aa' }}>Track:</strong> {raceState.track}
            </div>
            <div style={{ padding: 8, background: 'rgba(245, 166, 35, 0.1)', borderRadius: 4 }}>
              <strong style={{ color: '#f5a623' }}>Laps:</strong> {raceState.totalLaps} laps per race
            </div>
            <div style={{ padding: 8, background: 'rgba(233, 69, 96, 0.1)', borderRadius: 4 }}>
              <strong style={{ color: '#e94560' }}>Participants:</strong> {raceState.participants.length} drivers
            </div>
            <div style={{ padding: 8, background: 'rgba(245, 166, 35, 0.1)', borderRadius: 4 }}>
              <strong style={{ color: '#f5a623' }}>Lap Time:</strong> 45s - 1min (based on driver/car stats + RNG)
            </div>
            <div style={{ padding: 8, background: 'rgba(0, 212, 170, 0.1)', borderRadius: 4 }}>
              <strong style={{ color: '#00d4aa' }}>Next Race:</strong> 1 minute after current race ends
            </div>
          </div>
        </motion.div>
      )}

          {/* Race Countdown Overlay */}
          <RaceCountdown 
            isActive={showCountdown}
            onCountdownComplete={onCountdownComplete}
          />
        </>
      )}
    </div>
  )
}
