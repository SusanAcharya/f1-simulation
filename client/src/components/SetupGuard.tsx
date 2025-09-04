import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type SetupGuardProps = {
  children: React.ReactNode
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false)
      return
    }

    // Check if user has completed setup
    const profilePic = localStorage.getItem('userProfilePic')
    const carPic = localStorage.getItem('userCarPic')
    
    if (!profilePic || !carPic) {
      // User hasn't completed setup, redirect to setup
      navigate('/setup')
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, navigate])

  if (isChecking) {
    return (
      <div className="page container">
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏎️</div>
          <div style={{ color: '#00d4aa', fontSize: '1.2rem' }}>Loading your racing profile...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
