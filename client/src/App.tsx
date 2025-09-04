import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Forgot from './pages/auth/Forgot'
import Setup from './pages/Setup'
import Countdown from './components/Countdown'
import Dashboard from './pages/Dashboard'
import Garage from './pages/Garage'
import Driver from './pages/Driver'
import Facilities from './pages/Facilities'
import Profile from './pages/Profile'
import LiveRace from './pages/LiveRace'
import RaceHistory from './pages/RaceHistory'
import Leaderboard from './pages/Leaderboard'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import SetupGuard from './components/SetupGuard'

function TopNav() {
  return (
    <motion.header 
      style={{
        background: 'linear-gradient(135deg, #16213e, #0f3460)',
        borderBottom: '2px solid #e94560',
        padding: 'clamp(12px, 3vw, 20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'clamp(12px, 3vw, 20px)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img 
              src="/src/assets/logo/logo.png" 
              alt="Life is a Vibe" 
              style={{ 
                width: 'clamp(32px, 8vw, 40px)', 
                height: 'clamp(32px, 8vw, 40px)', 
                borderRadius: 8,
                filter: 'drop-shadow(0 0 10px rgba(245, 166, 35, 0.3))'
              }}
            />
            <span style={{ 
              fontFamily: 'Bangers, cursive', 
              fontSize: 'clamp(24px, 6vw, 32px)', 
              color: '#f5a623', 
              textShadow: '0 4px 0 rgba(0,0,0,0.6), 0 0 20px rgba(245, 166, 35, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(245, 166, 35, 0.3))'
            }}>
              Life is a Vibe
            </span>
          </motion.div>
        </Link>
        
        <nav style={{ 
          display: 'flex', 
          gap: 'clamp(16px, 4vw, 24px)',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/dashboard" style={{ 
              color: '#00d4aa', 
              textDecoration: 'none',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 'bold',
              padding: 'clamp(8px, 2vw, 12px)',
              borderRadius: 4,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              🏠 Dashboard
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/garage" style={{ 
              color: '#f5a623', 
              textDecoration: 'none',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 'bold',
              padding: 'clamp(8px, 2vw, 12px)',
              borderRadius: 4,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              🏎️ Garage
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/race" style={{ 
              color: '#00d4aa', 
              textDecoration: 'none',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 'bold',
              padding: 'clamp(8px, 2vw, 12px)',
              borderRadius: 4,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              🏁 Live Race
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/leaderboard" style={{ 
              color: '#e94560', 
              textDecoration: 'none',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 'bold',
              padding: 'clamp(8px, 2vw, 12px)',
              borderRadius: 4,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(233, 69, 96, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              🏆 Leaderboard
            </Link>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  )
}

function BottomNav() {
  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/garage', icon: '🏎️', label: 'Garage' },
    { href: '/race', icon: '🏁', label: 'Race' },
    { href: '/driver', icon: '👤', label: 'Driver' },
    { href: '/facilities', icon: '🏭', label: 'Facilities' },
    { href: '/profile', icon: '⚙️', label: 'Profile' }
  ]

  return (
    <motion.nav 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #16213e, #0f3460)',
        borderTop: '2px solid #e94560',
        padding: 'clamp(8px, 2vw, 12px)',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={item.href} 
              className="nav-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(2px, 1vw, 4px)',
                padding: 'clamp(8px, 2vw, 12px)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'white',
                transition: 'all 0.3s ease',
                minHeight: 'clamp(44px, 11vw, 60px)',
                minWidth: 'clamp(44px, 11vw, 60px)'
              }}
            >
              <span className="nav-icon" style={{ 
                fontSize: 'clamp(20px, 5vw, 24px)',
                marginBottom: 'clamp(2px, 1vw, 4px)'
              }}>
                {item.icon}
              </span>
              <span className="nav-label" style={{ 
                fontSize: 'clamp(8px, 2vw, 10px)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1
              }}>
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopNav />
      <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {children}
      </motion.main>
      <BottomNav />
    </div>
  )
}

function Landing() {
  return (
    <div className="page container">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ marginBottom: '2rem' }}
        >
          <img 
            src="/src/assets/logo/logo.png" 
            alt="Vibe with Life" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '20px',
              filter: 'drop-shadow(0 0 20px rgba(245, 166, 35, 0.5))',
              marginBottom: '1rem'
            }}
          />
        </motion.div>

        <motion.h1 
          style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #f5a623, #00d4aa, #e94560)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(245, 166, 35, 0.5))',
            fontFamily: 'Bangers, cursive',
            letterSpacing: '2px'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          VIBE WITH LIFE
        </motion.h1>
        
        <motion.p 
          className="muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', marginBottom: '1rem', lineHeight: 1.6 }}
        >
          🏎️ Arcade Racing Manager 🏁
        </motion.p>

        <motion.p 
          className="muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', marginBottom: '2rem', lineHeight: 1.5 }}
        >
          Experience the thrill of racing! Manage your driver, customize your car, and compete in live races every few minutes. 
          Build your racing empire and climb the leaderboard!
        </motion.p>
        
        <motion.div 
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Countdown />
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(0, 212, 170, 0.1)', 
            borderRadius: '12px', 
            border: '1px solid rgba(0, 212, 170, 0.3)' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏎️</div>
            <h3 style={{ color: '#00d4aa', marginBottom: '0.5rem' }}>Custom Cars</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>Choose from 12 unique racing cars and upgrade their performance</p>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(245, 166, 35, 0.1)', 
            borderRadius: '12px', 
            border: '1px solid rgba(245, 166, 35, 0.3)' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
            <h3 style={{ color: '#f5a623', marginBottom: '0.5rem' }}>Driver Stats</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>Train your driver's skills in cornering, overtaking, and more</p>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(233, 69, 96, 0.1)', 
            borderRadius: '12px', 
            border: '1px solid rgba(233, 69, 96, 0.3)' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏁</div>
            <h3 style={{ color: '#e94560', marginBottom: '0.5rem' }}>Live Races</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>Compete in real-time races with other players worldwide</p>
          </div>
        </motion.div>
        
        <motion.div 
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link className="button-primary" to="/login" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              🚀 Start Racing
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link className="button-secondary" to="/register" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              📝 Create Account
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/leaderboard" style={{ 
              fontSize: '1.1rem', 
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              🏆 View Leaderboard
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Enhanced floating elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          fontSize: '4rem',
          opacity: 0.1,
          zIndex: -1
        }}
        animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🏎️
      </motion.div>
      
      <motion.div
        style={{
          position: 'absolute',
          top: '25%',
          right: '8%',
          fontSize: '3rem',
          opacity: 0.1,
          zIndex: -1
        }}
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🏁
      </motion.div>
      
      <motion.div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          fontSize: '2.5rem',
          opacity: 0.1,
          zIndex: -1
        }}
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        🧑‍✈️
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          fontSize: '2rem',
          opacity: 0.1,
          zIndex: -1
        }}
        animate={{ y: [0, 25, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        🏆
      </motion.div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<Forgot />} />
              <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><SetupGuard><Dashboard /></SetupGuard></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><SetupGuard><Profile /></SetupGuard></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><SetupGuard><Profile /></SetupGuard></ProtectedRoute>} />
              <Route path="/garage" element={<ProtectedRoute><SetupGuard><Garage /></SetupGuard></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute><SetupGuard><Driver /></SetupGuard></ProtectedRoute>} />
              <Route path="/facilities" element={<ProtectedRoute><SetupGuard><Facilities /></SetupGuard></ProtectedRoute>} />
              <Route path="/race" element={<ProtectedRoute><SetupGuard><LiveRace /></SetupGuard></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><SetupGuard><RaceHistory /></SetupGuard></ProtectedRoute>} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
