import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Setup() {
  const [step, setStep] = useState(1) // 1: profile pic, 2: car pic
  const [selectedProfilePic, setSelectedProfilePic] = useState(1)
  const [selectedCarPic, setSelectedCarPic] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

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

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Save user preferences to localStorage
      localStorage.setItem('userProfilePic', selectedProfilePic.toString())
      localStorage.setItem('userCarPic', selectedCarPic.toString())
      
      // Save to database
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await fetch('/api/auth/pictures', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profilePic: selectedProfilePic,
            carPic: selectedCarPic
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to save pictures to database')
        }
      }
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Setup failed:', error)
      // Still navigate to dashboard even if database save fails
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page container">
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 style={{ 
            fontSize: '2.5rem',
            background: 'linear-gradient(45deg, #f5a623, #00d4aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Welcome, {user?.username}! 🏎️
          </h1>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Let's set up your racing profile
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 1 ? '#f5a623' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: step >= 1 ? '#000' : '#fff',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            1
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 2 ? '#f5a623' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: step >= 2 ? '#000' : '#fff',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            2
          </div>
        </motion.div>

        {/* Step 1: Profile Picture Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 style={{ 
              color: '#f5a623', 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              fontSize: '1.8rem'
            }}>
              Choose Your Profile Picture
            </h2>
            <p className="muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Select an avatar that represents your racing personality
            </p>
            
            <div style={{ 
              display: 'grid', 
              gap: '1rem', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              marginBottom: '2rem'
            }}>
              {profilePics.map((pic, index) => (
                <motion.div
                  key={index}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: selectedProfilePic === index + 1 ? '4px solid #f5a623' : '2px solid transparent',
                    cursor: 'pointer',
                    margin: '0 auto',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProfilePic(index + 1)}
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
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '12px 32px', fontSize: '1.1rem' }}
              >
                Next: Choose Car
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Car Picture Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 style={{ 
              color: '#00d4aa', 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              fontSize: '1.8rem'
            }}>
              Choose Your Racing Car
            </h2>
            <p className="muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Pick the car that will carry you to victory
            </p>
            
            <div style={{ 
              display: 'grid', 
              gap: '1rem', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              marginBottom: '2rem'
            }}>
              {carPics.map((pic, index) => (
                <motion.div
                  key={index}
                  style={{ 
                    width: '120px', 
                    height: '80px', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedCarPic === index + 1 ? '4px solid #00d4aa' : '2px solid transparent',
                    cursor: 'pointer',
                    margin: '0 auto',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCarPic(index + 1)}
                >
                  <img 
                    src={pic} 
                    alt={`Car ${index + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <motion.button 
                className="button-secondary"
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '12px 24px' }}
              >
                Back
              </motion.button>
              <motion.button 
                className="button-primary"
                onClick={handleComplete}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '12px 32px', fontSize: '1.1rem' }}
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
