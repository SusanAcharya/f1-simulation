import { motion } from 'framer-motion'
import type { RaceParticipant } from '../services/raceSimulation'

type RaceTrackProps = {
  participants: RaceParticipant[]
  currentLap: number
  totalLaps: number
  raceStatus?: 'waiting' | 'countdown' | 'racing' | 'finished'
}

export default function RaceTrack({ participants, currentLap, totalLaps }: RaceTrackProps) {
  const sortedParticipants = [...participants].sort((a, b) => a.position - b.position)
  
  // Debug logging
  console.log('RaceTrack render:', {
    participantsCount: participants.length,
    currentLap,
    totalLaps,
    participants: participants.map(p => ({
      name: p.username,
      lap: p.currentLap,
      progress: p.lapProgress.toFixed(2),
      position: p.position
    }))
  })
  
  return (
    <div className="race-track-container">
      <div className="race-track-header">
        <h3 style={{ color: '#00d4aa', marginBottom: 8 }}>🏁 Race Track</h3>
        <div className="race-info">
          <span className="lap-counter">Lap {currentLap} of {totalLaps}</span>
          <span className="participant-count">{participants.length} Drivers</span>
        </div>
      </div>
      
      <div className="race-track">
        {/* Track outline */}
        <div className="track-outline">
          <div className="track-start-finish">
            <div className="start-finish-line">🏁</div>
          </div>
          
          {/* Track sections */}
          <div className="track-section track-straight-1"></div>
          <div className="track-section track-turn-1"></div>
          <div className="track-section track-straight-2"></div>
          <div className="track-section track-turn-2"></div>
          <div className="track-section track-straight-3"></div>
          <div className="track-section track-turn-3"></div>
          <div className="track-section track-straight-4"></div>
          <div className="track-section track-turn-4"></div>
        </div>
        
        {/* Participants on track */}
        {sortedParticipants.map((participant) => (
          <motion.div
            key={participant.id}
            className={`race-car ${participant.retired ? 'retired' : ''}`}
            style={{
              '--car-position': participant.position,
              '--car-progress': participant.lapProgress,
              '--car-lap': participant.currentLap
            } as React.CSSProperties}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: `${(participant.lapProgress / 100) * 80}%`,
              y: `${(participant.position - 1) * 25}px`
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            <div className="car-avatar">
              <img 
                src={participant.profilePic || '/src/assets/profile-pics/profile-pic1.png'} 
                alt={participant.username}
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/profile-pics/profile-pic1.png'
                }}
              />
            </div>
            <div className="car-info">
              <div className="car-username">{participant.username}</div>
              <div className="car-position">#{participant.position}</div>
              <div className="car-lap">L{participant.currentLap}</div>
            </div>
            
            {/* Position indicator */}
            <div className="position-indicator">
              {participant.position === 1 && <span className="leader">🥇</span>}
              {participant.position === 2 && <span className="second">🥈</span>}
              {participant.position === 3 && <span className="third">🥉</span>}
              {participant.position > 3 && <span className="position">{participant.position}</span>}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Lap progress bars */}
      <div className="lap-progress">
        <h4 style={{ color: '#f5a623', marginBottom: 12 }}>Lap Progress</h4>
        <div className="progress-bars">
          {sortedParticipants.slice(0, 8).map((participant) => (
            <div key={participant.id} className="progress-bar-container">
              <div className="progress-label">
                <span className="driver-name">{participant.username}</span>
                <span className="lap-info">L{participant.currentLap}/{totalLaps}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${participant.lapProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    background: participant.position === 1 ? '#00ff88' :
                               participant.position <= 3 ? '#f5a623' : '#00d4aa'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
