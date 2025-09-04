import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Forgot() {
  const [email, setEmail] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert(`Password reset link requested for ${email}`)
  }

  return (
    <div className="page container">
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Forgot Password</h1>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            <div className="muted">Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </label>
          <button className="button-primary" type="submit">Send Reset Link</button>
        </form>
      </motion.div>
    </div>
  )
}

