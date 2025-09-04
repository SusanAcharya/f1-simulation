import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { raceHistoryService, type RaceHistoryEntry } from '../services/raceHistoryService'
import { useAuth } from '../context/AuthContext'

export default function RaceHistory() {
  const { isAuthenticated, user } = useAuth()
  const [raceHistory, setRaceHistory] = useState<RaceHistoryEntry[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRaceHistory()
  }, [isAuthenticated])

  const loadRaceHistory = () => {
    setLoading(true)
    try {
      const history = raceHistoryService.getRaceHistory()
      setRaceHistory(history)
      
      if (isAuthenticated && user) {
        const stats = raceHistoryService.getUserStats(user.id)
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Failed to load race history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return '#ffd700'
      case 2: return '#c0c0c0'
      case 3: return '#cd7f32'
      default: return '#00d4aa'
    }
  }

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏁'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#00d4aa' }}>Loading race history...</div>
      </div>
    )
  }

  if (raceHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3 style={{ color: '#f5a623', marginBottom: '1rem' }}>📊 Race History</h3>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          No races completed yet. Start your first race to see your history here!
        </p>
        <button 
          className="button-primary" 
          onClick={() => window.location.href = '/live-race'}
        >
          🏁 Start Racing
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ color: '#f5a623', marginBottom: '1.5rem' }}>📊 Race History</h3>
      
      {/* User Stats */}
      {isAuthenticated && userStats && (
        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <h4 style={{ color: '#00d4aa', marginBottom: '1rem' }}>Your Racing Stats</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4aa' }}>
                {userStats.totalRaces}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Races</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700' }}>
                {userStats.wins}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Wins</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(192, 192, 192, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c0c0c0' }}>
                {userStats.podiums}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Podiums</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4aa' }}>
                {userStats.totalPoints}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Points</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 166, 35, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f5a623' }}>
                {userStats.totalTokens}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Tokens</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4aa' }}>
                {userStats.averagePosition}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Avg Position</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Race History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {raceHistory.map((race, index) => (
          <motion.div
            key={race.id}
            className="card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ color: '#00d4aa', marginBottom: '0.5rem' }}>
                  {race.raceName} - {race.track}
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                  {formatDate(race.date)} • {race.totalLaps} laps • {race.totalParticipants} drivers
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f5a623' }}>
                  {race.winner?.username}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>Winner</div>
              </div>
            </div>

            {/* Podium */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px'
            }}>
              {race.podium.map((participant) => (
                <div key={participant.id} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {getPositionEmoji(participant.position)}
                  </div>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    margin: '0 auto 0.5rem',
                    border: `3px solid ${getPositionColor(participant.position)}`
                  }}>
                    <img 
                      src={participant.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                      alt={participant.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: getPositionColor(participant.position),
                    fontSize: '0.9rem'
                  }}>
                    {participant.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {participant.earnedPoints || 0} pts
                  </div>
                </div>
              ))}
            </div>

            {/* Full Results */}
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: '#00d4aa', 
                fontWeight: 'bold',
                padding: '0.5rem',
                background: 'rgba(0, 212, 170, 0.1)',
                borderRadius: '4px'
              }}>
                View Full Results ({race.participants.length} drivers)
              </summary>
              <div style={{ marginTop: '1rem' }}>
                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Pos</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Driver</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Points</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Tokens</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {race.participants
                      .sort((a, b) => a.position - b.position)
                      .map((participant) => (
                        <tr key={participant.id} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ 
                            padding: '0.5rem', 
                            fontWeight: 'bold',
                            color: getPositionColor(participant.position)
                          }}>
                            {participant.dnf ? 'DNF' : participant.position}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                overflow: 'hidden' 
                              }}>
                                <img 
                                  src={participant.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                                  alt={participant.username}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              {participant.username}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem', color: '#00d4aa' }}>
                            {participant.earnedPoints || 0}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem', color: '#f5a623' }}>
                            {participant.earnedTokens || 0}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                            {participant.dnf ? (
                              <span style={{ color: '#e94560', fontWeight: 'bold' }}>DNF</span>
                            ) : (
                              <span style={{ color: '#00ff88' }}>Finished</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
