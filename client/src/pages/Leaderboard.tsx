import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { leaderboardAPI } from '../services/api'

type LeaderboardEntry = {
  id: string
  username: string
  points: number
  races: number
  wins: number
  podiums: number
  position: number
  isCurrentUser?: boolean
  profilePic: number
  carPic?: number
}

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const { isAuthenticated, user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await leaderboardAPI.getLeaderboard()
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        // Map incoming data to LeaderboardEntry shape; fallback defaults
        const mapped: LeaderboardEntry[] = (data || []).map((u: any, idx: number) => ({
          id: u.userId || u.id || u._id || `${idx}`,
          username: u.username || 'Player',
          points: u.points ?? 0,
          races: u.races ?? 0,
          wins: u.wins ?? 0,
          podiums: u.podiums ?? 0,
          position: idx + 1,
          isCurrentUser: user ? ((u.userId || u.id || u._id) === user.id) : Boolean(u.isCurrentUser),
          profilePic: (u.profilePic && Number(u.profilePic)) || 1,
          carPic: (u.carPic && Number(u.carPic)) || 1
        }))
        if (mounted) setLeaderboard(mapped)
      } catch (e) {
        // leave empty -> empty state renders
      }
    })()
    return () => { mounted = false }
  }, [])

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentUserPosition = isAuthenticated ? leaderboard.find(entry => entry.isCurrentUser)?.position || 0 : 0

  const profilePics = [
    '/src/assets/profile-pics/profile-pic1.png',
    '/src/assets/profile-pics/profile-pic2.png',
    '/src/assets/profile-pics/profile-pic3.png',
    '/src/assets/profile-pics/profile-pic4.png',
    '/src/assets/profile-pics/profile-pic5.png',
    '/src/assets/profile-pics/profile-pic6.png',
    '/src/assets/profile-pics/profile-pic7.png',
    '/src/assets/profile-pics/profile-pic8.png',
    '/src/assets/profile-pics/profile-pic9.png',
    '/src/assets/profile-pics/profile-pic10.png',
    '/src/assets/profile-pics/profile-pic11.png',
    '/src/assets/profile-pics/profile-pic12.png'
  ]

  // Show empty state if no leaderboard data
  if (leaderboard.length === 0) {
    return (
      <div className="page container">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ 
            fontSize: '3rem',
            background: 'linear-gradient(45deg, #f5a623, #00d4aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '2rem'
          }}
        >
          🏆 Leaderboard
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '3rem 1rem' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏁</div>
          <h2 style={{ marginBottom: '1rem', color: '#00d4aa' }}>No Races Yet!</h2>
          <p style={{ color: '#888', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Be the first to start racing and climb the leaderboard!
          </p>
          {!isAuthenticated && (
            <div>
              <button 
                className="button-primary" 
                onClick={() => window.location.href = '/login'}
                style={{ marginRight: '1rem' }}
              >
                🚀 Login to Race
              </button>
              <button 
                className="button-secondary" 
                onClick={() => window.location.href = '/register'}
              >
                📝 Create Account
              </button>
            </div>
          )}
          {isAuthenticated && (
            <button 
              className="button-primary" 
              onClick={() => window.location.href = '/live-race'}
            >
              🏁 Start Racing
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page container">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(45deg, #f5a623, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}
      >
        🏆 Leaderboard
      </motion.h1>
      
      {/* Search and Current Position */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: 14
              }}
            />
          </div>
          {isAuthenticated && currentUserPosition > 0 ? (
            <div style={{ 
              padding: 8, 
              background: 'rgba(0, 212, 170, 0.1)', 
              borderRadius: 4,
              border: '1px solid #00d4aa',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 12, color: '#00d4aa' }}>Your Rank</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#00d4aa' }}>
                #{currentUserPosition}
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div style={{ 
              padding: 8, 
              background: 'rgba(245, 166, 35, 0.1)', 
              borderRadius: 4,
              border: '1px solid #f5a623',
              textAlign: 'center'
            }}>
              <Link to="/login" style={{ color: '#f5a623', textDecoration: 'none', fontSize: 12 }}>
                Login to see your rank
              </Link>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 16 }}
      >
        <h3 style={{ color: '#f5a623', marginBottom: 16, textAlign: 'center' }}>Top 3</h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 16 }}>
          {/* 2nd Place */}
          {filteredLeaderboard[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                padding: 12,
                background: 'linear-gradient(135deg, #f5a623, #ffb800)',
                borderRadius: 4,
                textAlign: 'center',
                minWidth: 120
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🥈</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>
                {filteredLeaderboard[1].username}
              </div>
              <div style={{ fontSize: 12, color: '#000' }}>
                {filteredLeaderboard[1].points} pts
              </div>
            </motion.div>
          )}
          
          {/* 1st Place */}
          {filteredLeaderboard[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: 16,
                background: 'linear-gradient(135deg, #00ff88, #00d4aa)',
                borderRadius: 4,
                textAlign: 'center',
                minWidth: 140,
                transform: 'scale(1.1)'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🥇</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                {filteredLeaderboard[0].username}
              </div>
              <div style={{ fontSize: 14, color: '#000' }}>
                {filteredLeaderboard[0].points} pts
              </div>
            </motion.div>
          )}
          
          {/* 3rd Place */}
          {filteredLeaderboard[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                padding: 12,
                background: 'linear-gradient(135deg, #e94560, #ff4757)',
                borderRadius: 4,
                textAlign: 'center',
                minWidth: 120
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🥉</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
                {filteredLeaderboard[2].username}
              </div>
              <div style={{ fontSize: 12, color: '#fff' }}>
                {filteredLeaderboard[2].points} pts
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 style={{ color: '#00d4aa', marginBottom: 16 }}>Full Leaderboard</h3>
        
        <div style={{ display: 'grid', gap: 8 }}>
          {filteredLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ 
                padding: 12,
                background: entry.isCurrentUser ? 'rgba(0, 212, 170, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                border: entry.isCurrentUser ? '1px solid #00d4aa' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  minWidth: 30, 
                  textAlign: 'center', 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  color: entry.position === 1 ? '#00ff88' :
                         entry.position <= 3 ? '#f5a623' : '#e94560'
                }}>
                  {entry.position <= 3 ? (
                    entry.position === 1 ? '🥇' : 
                    entry.position === 2 ? '🥈' : '🥉'
                  ) : (
                    `#${entry.position}`
                  )}
                </div>
                
                <Link 
                  to={`/profile/${entry.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div 
                    style={{ 
                      width: 40, 
                      height: 40, 
                      background: entry.isCurrentUser ? 
                        'linear-gradient(45deg, #00d4aa, #00ff88)' :
                        'linear-gradient(45deg, #e94560, #f5a623)',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <img 
                      src={profilePics[entry.profilePic - 1]} 
                      alt={entry.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </motion.div>
                </Link>
                
                <div style={{ flex: 1 }}>
                  <Link 
                    to={`/profile/${entry.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 'bold',
                      color: entry.isCurrentUser ? '#00d4aa' : 'white',
                      cursor: 'pointer'
                    }}>
                      {entry.username}
                      {entry.isCurrentUser && ' (You)'}
                    </div>
                  </Link>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {entry.races} races • {entry.wins} wins • {entry.podiums} podiums
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: entry.isCurrentUser ? '#00d4aa' : '#f5a623',
                    textShadow: entry.isCurrentUser ? '0 0 10px rgba(0, 212, 170, 0.6)' : 'none'
                  }}>
                    {entry.points} {entry.isCurrentUser ? '(You)' : ''}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>points</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredLeaderboard.length === 0 && (
          <div style={{ 
            padding: 24, 
            textAlign: 'center', 
            color: '#666',
            fontSize: 14
          }}>
            No players found matching "{searchTerm}"
          </div>
        )}
      </motion.div>
    </div>
  )
}
