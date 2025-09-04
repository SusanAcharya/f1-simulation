import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    
    try {
      await registerUser(username, email, password)
      setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' })
      setTimeout(() => {
        navigate('/setup')
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page container">
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Create Account</h1>
        
        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: message.type === 'success' 
                ? 'rgba(0, 212, 170, 0.2)' 
                : 'rgba(233, 69, 96, 0.2)',
              border: `1px solid ${message.type === 'success' ? '#00d4aa' : '#e94560'}`,
              color: message.type === 'success' ? '#00d4aa' : '#e94560',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {message.text}
          </motion.div>
        )}
        
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            <div className="muted">Username</div>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.12)', 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white',
                opacity: isLoading ? 0.6 : 1
              }} 
            />
          </label>
          <label>
            <div className="muted">Email</div>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              required 
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.12)', 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white',
                opacity: isLoading ? 0.6 : 1
              }} 
            />
          </label>
          <label>
            <div className="muted">Password</div>
            <input 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type="password" 
              required 
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.12)', 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white',
                opacity: isLoading ? 0.6 : 1
              }} 
            />
          </label>
          <button 
            className="button-primary" 
            type="submit" 
            disabled={isLoading}
            style={{ 
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

