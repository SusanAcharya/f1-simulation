import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'

// Extended user profile type that includes driver, car, and race stats
type ExtendedUserProfile = {
  username: string
  email: string
  joinedDate: string
  tokens: number
  points: number
  profilePic: number
  driver: {
    name: string
    stats: { cornering: number; overtaking: number; defending: number; aggression: number; composure: number }
  }
  car: {
    name: string
    stats: { speed: number; acceleration: number; braking: number; aero: number; fuel: number; tireWear: number; grip: number; durability: number }
    condition: number
  }
  raceStats: { totalRaces: number; wins: number; podiums: number; totalPoints: number; bestFinish: number; averagePosition: number }
}

export default function Profile() {
  const { userId } = useParams()
  const { isAuthenticated, logout } = useAuth()
  const [selectedProfilePic, setSelectedProfilePic] = useState(1)
  const [selectedCarPic, setSelectedCarPic] = useState(1)
  const [showProfilePicSelector, setShowProfilePicSelector] = useState(false)
  const [showCarSelector, setShowCarSelector] = useState(false)

  useEffect(() => {
    // Load user's selected pictures from localStorage as fallback
    const savedProfilePic = localStorage.getItem('userProfilePic')
    const savedCarPic = localStorage.getItem('userCarPic')
    
    if (savedProfilePic) setSelectedProfilePic(parseInt(savedProfilePic))
    if (savedCarPic) setSelectedCarPic(parseInt(savedCarPic))
  }, [])

  // Show login prompt for unauthenticated users
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
            You need to be logged in to view your profile and racing statistics.
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

  const [otherProfile, setOtherProfile] = useState<ExtendedUserProfile | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<ExtendedUserProfile | null>(null)
  const { user } = useAuth()
  
  // Fetch current user's full profile data from backend
  useEffect(() => {
    if (isAuthenticated && user && (!userId || userId === user.id)) {
      authAPI.getUserById(user.id)
        .then(res => {
          const u = res.data
          const mapped: ExtendedUserProfile = {
            username: u.username,
            email: u.email || '',
            joinedDate: u.joinedDate || new Date().toISOString(),
            tokens: u.tokens ?? 0,
            points: u.points ?? 0,
            profilePic: u.profilePic || 1,
            driver: u.driver || { name: `${u.username} Racer`, stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 } },
            car: u.car || { name: `${u.username}'s Car`, stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 }, condition: 100 },
            raceStats: u.raceStats || { totalRaces: 0, wins: 0, podiums: 0, totalPoints: u.points || 0, bestFinish: 0, averagePosition: 0 }
          }
          setCurrentUserProfile(mapped)
          if (u.carPic) setSelectedCarPic(Number(u.carPic))
          if (u.profilePic) setSelectedProfilePic(Number(u.profilePic))
        })
        .catch(() => {
          // Fallback to default profile if fetch fails
          console.error('Failed to fetch current user profile')
        })
    }
  }, [isAuthenticated, user, userId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (userId && user && userId !== user.id) {
        try {
          const res = await authAPI.getUserById(userId)
          const u = res.data
          const mapped: ExtendedUserProfile = {
            username: u.username,
            email: u.email || '',
            joinedDate: u.joinedDate || new Date().toISOString(),
            tokens: u.tokens ?? 0,
            points: u.points ?? 0,
            profilePic: u.profilePic || 1,
            driver: u.driver || { name: `${u.username} Racer`, stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 } },
            car: u.car || { name: `${u.username}'s Car`, stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 }, condition: 100 },
            raceStats: u.raceStats || { totalRaces: 0, wins: 0, podiums: 0, totalPoints: u.points ?? 0, bestFinish: 0, averagePosition: 0 }
          }
          if (mounted) setOtherProfile(mapped)
        } catch {}
      }
    })()
    return () => { mounted = false }
  }, [userId, user])

  const isOwnProfile = !userId || (user && userId === user.id)
  
  // Create a unified profile object that works for both current user and other users
  const getDisplayProfile = (): ExtendedUserProfile | null => {
    if (isOwnProfile) {
      // Use the current user profile data from backend
      return currentUserProfile
    } else {
      return otherProfile
    }
  }

  const displayProfile = getDisplayProfile()

  if (!displayProfile) {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👤</div>
          <div>Loading profile...</div>
        </div>
      </div>
    )
  }

  const joinDate = new Date(displayProfile.joinedDate).toLocaleDateString()
  const profilePicIndex = displayProfile.profilePic

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

  const carPics = [
    '/src/assets/cars/racecar1.png',
    '/src/assets/cars/racecar2.png',
    '/src/assets/cars/racecar3.png',
    '/src/assets/cars/racecar4.png',
    '/src/assets/cars/racecar5.png',
    '/src/assets/cars/racecar6.png',
    '/src/assets/cars/racecar7.png',
    '/src/assets/cars/racecar8.png',
    '/src/assets/cars/racecar9.png',
    '/src/assets/cars/racecar10.png',
    '/src/assets/cars/racecar11.png',
    '/src/assets/cars/racecar12.png'
  ]

  function changeProfilePic(picIndex: number) {
    setSelectedProfilePic(picIndex)
    setShowProfilePicSelector(false)
    localStorage.setItem('userProfilePic', picIndex.toString())
  }

  function changeCarPic(picIndex: number) {
    setSelectedCarPic(picIndex)
    setShowCarSelector(false)
    localStorage.setItem('userCarPic', picIndex.toString())
  }

  return (
    <div className="page container">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(45deg, #e94560, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}
      >
        👤 {isOwnProfile ? 'My Profile' : `${displayProfile.username}'s Profile`}
      </motion.h1>
      
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Profile Info Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ 
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            border: '1px solid rgba(233, 69, 96, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <motion.div 
              style={{ 
                width: 'clamp(80px, 20vw, 120px)', 
                height: 'clamp(80px, 20vw, 120px)', 
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #f5a623',
                cursor: isOwnProfile ? 'pointer' : 'default'
              }}
              whileHover={isOwnProfile ? { scale: 1.05 } : {}}
              onClick={() => isOwnProfile && setShowProfilePicSelector(true)}
            >
              <img 
                src={profilePics[profilePicIndex - 1]} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
            
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#f5a623', 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
            }}>
              {displayProfile.username}
            </h3>
            <div className="muted" style={{ marginBottom: 16 }}>
              Racing Enthusiast
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: 8, fontSize: 'clamp(10px, 2.5vw, 12px)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Username:</span>
              <span>{displayProfile.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Joined:</span>
              <span>{joinDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Total Points:</span>
              <span style={{ color: '#f5a623', fontWeight: 'bold' }}>{displayProfile.raceStats.totalPoints || 0}</span>
            </div>
          </div>
          
          {isOwnProfile && (
            <div style={{ marginTop: 16 }}>
              <motion.button 
                className="button-secondary" 
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Race Stats Card */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 style={{ color: '#00d4aa', marginBottom: 16 }}>Racing Statistics</h3>
          
          <div className="grid-4" style={{ gap: 8 }}>
            <div style={{ 
              padding: 'clamp(12px, 3vw, 16px)', 
              background: 'rgba(0, 255, 136, 0.1)', 
              borderRadius: 8,
              border: '1px solid #00ff88',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: '#00ff88' }}>
                {displayProfile.raceStats.totalRaces || 0}
              </div>
              <div className="muted" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Total Races</div>
            </div>
            
            <div style={{ 
              padding: 'clamp(12px, 3vw, 16px)', 
              background: 'rgba(245, 166, 35, 0.1)', 
              borderRadius: 8,
              border: '1px solid #f5a623',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: '#f5a623' }}>
                {displayProfile.raceStats.wins || 0}
              </div>
              <div className="muted" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Wins</div>
            </div>
            
            <div style={{ 
              padding: 'clamp(12px, 3vw, 16px)', 
              background: 'rgba(0, 212, 170, 0.1)', 
              borderRadius: 8,
              border: '1px solid #00d4aa',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: '#00d4aa' }}>
                {displayProfile.raceStats.podiums || 0}
              </div>
              <div className="muted" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Podiums</div>
            </div>
            
            <div style={{ 
              padding: 'clamp(12px, 3vw, 16px)', 
              background: 'rgba(233, 69, 96, 0.1)', 
              borderRadius: 8,
              border: '1px solid #e94560',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: '#e94560' }}>
                {(displayProfile.raceStats.averagePosition || 0).toFixed(1)}
              </div>
              <div className="muted" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Avg Position</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Driver & Car Stats */}
      <div className="grid-2" style={{ marginTop: 16 }}>
        {/* Driver Stats */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ 
            scale: 1.01, 
            y: -4,
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h3 style={{ color: '#00d4aa', marginBottom: 16 }}>Driver Stats</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(displayProfile.driver.stats).map(([key, value]) => (
              <div key={key} style={{ 
                padding: 'clamp(6px, 2vw, 8px)', 
                background: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    minWidth: 'clamp(80px, 20vw, 100px)', 
                    fontSize: 'clamp(10px, 2.5vw, 12px)', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold' 
                  }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    height: 'clamp(10px, 2.5vw, 12px)', 
                    background: '#0f3460', 
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      style={{
                        width: `${value}%`,
                        height: '100%',
                        background: value >= 80 ? '#00ff88' : value >= 60 ? '#f5a623' : '#e94560',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div style={{ 
                    minWidth: 'clamp(25px, 6vw, 30px)', 
                    textAlign: 'right', 
                    fontSize: 'clamp(10px, 2.5vw, 12px)', 
                    fontWeight: 'bold' 
                  }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Car Stats */}
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
        >
          <h3 style={{ color: '#e94560', marginBottom: 16 }}>Car Stats</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(displayProfile.car.stats).map(([key, value]) => (
              <div key={key} style={{ 
                padding: 'clamp(6px, 2vw, 8px)', 
                background: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    minWidth: 'clamp(80px, 20vw, 100px)', 
                    fontSize: 'clamp(10px, 2.5vw, 12px)', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold' 
                  }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    height: 'clamp(10px, 2.5vw, 12px)', 
                    background: '#0f3460', 
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      style={{
                        width: `${value}%`,
                        height: '100%',
                        background: value >= 80 ? '#00ff88' : value >= 60 ? '#f5a623' : '#e94560',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div style={{ 
                    minWidth: 'clamp(25px, 6vw, 30px)', 
                    textAlign: 'right', 
                    fontSize: 'clamp(10px, 2.5vw, 12px)', 
                    fontWeight: 'bold' 
                  }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: 16, 
            padding: 'clamp(10px, 2.5vw, 12px)', 
            background: 'rgba(233, 69, 96, 0.1)', 
            borderRadius: 8,
            border: '1px solid #e94560'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div 
                style={{ 
                  width: '60px', 
                  height: '40px', 
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: isOwnProfile ? 'pointer' : 'default',
                  border: '2px solid #e94560'
                }}
                whileHover={isOwnProfile ? { scale: 1.05 } : {}}
                onClick={() => isOwnProfile && setShowCarSelector(true)}
              >
                <img 
                  src={carPics[selectedCarPic - 1]} 
                  alt="Car" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </motion.div>
              <div>
                <div style={{ 
                  fontSize: 'clamp(12px, 3vw, 14px)', 
                  fontWeight: 'bold', 
                  color: '#e94560' 
                }}>
                  {displayProfile.car.name}
                </div>
                <div className="muted" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>
                  Condition: {displayProfile.car.condition}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Picture Selector Modal */}
      {showProfilePicSelector && (
        <motion.div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'clamp(16px, 4vw, 24px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="card"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            style={{ 
              maxWidth: 'min(500px, 90vw)', 
              maxHeight: '80vh', 
              overflow: 'auto',
              background: '#16213e',
              width: '100%'
            }}
          >
            <h3 style={{ 
              color: '#f5a623', 
              marginBottom: 16,
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
              textAlign: 'center'
            }}>
              Choose Profile Picture
            </h3>
            <div style={{ 
              display: 'grid', 
              gap: 'clamp(8px, 2vw, 12px)', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
              marginBottom: 16,
              maxWidth: '100%'
            }}>
              {profilePics.map((pic, index) => (
                <motion.div
                  key={index}
                  style={{ 
                    width: 'clamp(60px, 15vw, 80px)', 
                    height: 'clamp(60px, 15vw, 80px)', 
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: selectedProfilePic === index + 1 ? '3px solid #f5a623' : '2px solid transparent',
                    cursor: 'pointer',
                    margin: '0 auto'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => changeProfilePic(index + 1)}
                >
                  <img 
                    src={pic} 
                    alt={`Profile ${index + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <motion.button 
                className="button-primary"
                onClick={() => setShowProfilePicSelector(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: 'clamp(120px, 30vw, 200px)' }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Car Picture Selector Modal */}
      {showCarSelector && (
        <motion.div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'clamp(16px, 4vw, 24px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="card"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            style={{ 
              maxWidth: 'min(600px, 90vw)', 
              maxHeight: '80vh', 
              overflow: 'auto',
              background: '#16213e',
              width: '100%'
            }}
          >
            <h3 style={{ 
              color: '#00d4aa', 
              marginBottom: 16,
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
              textAlign: 'center'
            }}>
              Choose Your Racing Car
            </h3>
            <div style={{ 
              display: 'grid', 
              gap: 'clamp(8px, 2vw, 12px)', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              marginBottom: 16,
              maxWidth: '100%'
            }}>
              {carPics.map((pic, index) => (
                <motion.div
                  key={index}
                  style={{ 
                    width: 'clamp(100px, 25vw, 120px)', 
                    height: 'clamp(60px, 15vw, 80px)', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedCarPic === index + 1 ? '3px solid #00d4aa' : '2px solid transparent',
                    cursor: 'pointer',
                    margin: '0 auto'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeCarPic(index + 1)}
                >
                  <img 
                    src={pic} 
                    alt={`Car ${index + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <motion.button 
                className="button-primary"
                onClick={() => setShowCarSelector(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: 'clamp(120px, 30vw, 200px)' }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
