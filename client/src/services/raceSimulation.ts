import type { Driver, Car } from '../types/domain'

export type RaceParticipant = {
  id: string
  userId: string
  username: string
  profilePic?: string
  carPic?: string | number
  driver: Driver
  car: Car
  position: number
  currentLap: number
  lapProgress: number // 0-100% through cu rrent lap
  lapTime: string
  bestLap: string
  totalTime: string
  gap: string
  retired: boolean
  finished?: boolean
  lastLapTime: number // in milliseconds
  lapTimes: number[] // array of lap times in milliseconds
  currentLapPlannedMs?: number
  currentLapElapsedMs?: number
  currentEffectiveLapMs?: number
  earnedPoints?: number
  earnedTokens?: number
  dnf?: boolean // Did Not Finish
  // Dynamic per-race systems
  fuelRemaining?: number // 0-100 (starts 100)
  tireRemaining?: number // 0-100 (remaining tread)
  hasPitted?: boolean
  pitting?: boolean
  pitTicksRemaining?: number // in-game seconds remaining in pit
}

export type RaceState = {
  id: string
  name: string
  track: string
  status: 'waiting' | 'countdown' | 'racing' | 'finished'
  participants: RaceParticipant[]
  currentLap: number
  totalLaps: number
  startTime: number | null
  endTime: number | null
  lapTimes: { [participantId: string]: number[] }
}

export class RaceSimulation {
  private raceState: RaceState
  private animationFrame: number | null = null
  private lastUpdate: number = 0
  // Simulation granularity: 1-second in-game ticks
  private updateInterval: number = 1000 // 1000ms = 1 in-game second per tick
  private storageKey: string = 'vibe-race-simulation'
  private finishCounter: number = 0
  private callbacks: {
    onRaceUpdate?: (state: RaceState) => void
    onLapComplete?: (participantId: string, lap: number, lapTime: number) => void
    onPositionChange?: (participantId: string, newPosition: number) => void
    onRaceFinished?: (finalState: RaceState) => void
  } = {}

  constructor(raceData: any, participants: any[]) {
    // Try to load existing race state from localStorage
    const savedState = this.loadRaceState()
    
    if (savedState && savedState.status === 'racing') {
      // Resume existing race
      this.raceState = savedState
      console.log('Resuming existing race:', this.raceState.id)
      // Ensure planned and elapsed lap timing exists for smooth resume
      this.raceState.participants.forEach(p => {
        if (!p.currentLapPlannedMs) {
          p.currentLapPlannedMs = this.computePlannedLapMs(p)
        }
        if (p.currentLapElapsedMs == null) {
          p.currentLapElapsedMs = Math.max(0, Math.min(p.currentLapPlannedMs, (p.lapProgress / 100) * p.currentLapPlannedMs))
        }
      })
      // Resume animation loop
      this.startSimulation()
    } else {
      // Create new race
      this.raceState = {
        id: raceData.id || 'race-1',
        name: raceData.name || 'Pixel Speedway Circuit',
        track: raceData.track || 'Circuit 1',
        status: 'waiting',
        participants: participants || [],
        currentLap: 1,
        totalLaps: 10,
        startTime: null,
        endTime: null,
        lapTimes: {}
      }
      
      this.initializeParticipants(participants)
    }
  }

  private initializeParticipants(participants: any[]) {
    if (!participants || participants.length === 0) {
      this.raceState.participants = []
      return
    }
    
    this.raceState.participants = participants.map((participant, index) => {
      const driver = participant.driver || {
        id: `driver-${index}`,
        userId: participant.userId || `user-${index}`,
        name: participant.username || `Driver ${index + 1}`,
        stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 },
        statPointsAvailable: 0
      }
      
      const car = participant.car || {
        id: `car-${index}`,
        userId: participant.userId || `user-${index}`,
        name: 'Default Car',
        stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 },
        statPointsAvailable: 0,
        condition: 100
      }

      return {
        id: participant.id || `participant-${index}`,
        userId: participant.userId || `user-${index}`,
        username: participant.username || `Driver ${index + 1}`,
        profilePic: participant.profilePic || `/src/assets/profile-pics/profile-pic${(index % 12) + 1}.png`,
        carPic: participant.carPic || `/src/assets/cars/racecar${(index % 12) + 1}.png`,
        driver,
        car,
        position: index + 1,
        currentLap: 1,
        lapProgress: 0,
        lapTime: '0:00.000',
        bestLap: '0:00.000',
        totalTime: '0:00.000',
        gap: index === 0 ? '--' : '+0.000',
        retired: false,
        finished: false,
        lastLapTime: 0,
        lapTimes: [],
        currentLapPlannedMs: undefined,
        currentLapElapsedMs: 0
      }
    })

    // Initialize lap times tracking
    this.raceState.participants.forEach(participant => {
      this.raceState.lapTimes[participant.id] = []
    })
  }

  public startRace() {
    this.raceState.status = 'countdown'
    this.raceState.startTime = Date.now()
    
    // Notify state change
    this.callbacks.onRaceUpdate?.(JSON.parse(JSON.stringify(this.raceState)))
    
    // Start the simulation after 3 second countdown
    setTimeout(() => {
      this.raceState.status = 'racing'
      this.raceState.startTime = Date.now()
      this.startSimulation()
      
      // Notify state change again
      this.callbacks.onRaceUpdate?.(JSON.parse(JSON.stringify(this.raceState)))
    }, 3000)
  }

  public startRaceImmediately() {
    this.raceState.status = 'racing'
    this.raceState.startTime = Date.now()
    this.startSimulation()
    
    // Notify state change
    this.callbacks.onRaceUpdate?.(JSON.parse(JSON.stringify(this.raceState)))
  }

  private startSimulation() {
    this.lastUpdate = performance.now()
    this.animate()
  }

  private animate(currentTime: number = performance.now()) {
    if (this.raceState.status !== 'racing') return

    const deltaTime = currentTime - this.lastUpdate
    
    if (deltaTime >= this.updateInterval) {
      this.updateRace(deltaTime)
      this.lastUpdate = currentTime
    }

    this.animationFrame = requestAnimationFrame(this.animate.bind(this))
  }

  private updateRace(deltaTime: number) {
    // Update each participant's progress per 1-second in-game tick
    this.raceState.participants.forEach(participant => {
      if (participant.retired || participant.finished) return

      // Ensure lap plan exists
      if (!participant.currentLapPlannedMs || participant.currentLapPlannedMs <= 0) {
        participant.currentLapPlannedMs = this.computePlannedLapMs(participant)
        participant.currentLapElapsedMs = 0
      }

      // Compute effective lap time this tick using emergent formula components
      const effectiveLapMs = this.computeEffectiveLapMs(participant)
      participant.currentEffectiveLapMs = effectiveLapMs
      
      // Convert tick to progress increment based on effective lap duration
      const progressIncrement = (deltaTime / effectiveLapMs) * 100
      
      // DNF / accidents per tick – after lap 4
      if ((participant.currentLap || 1) > 4) {
        const stepProbability = this.calculateTickDNFProbability(participant)
        if (Math.random() < stepProbability) {
          participant.retired = true
          participant.dnf = true
          return
        }
      }

      participant.lapProgress += progressIncrement
      participant.currentLapElapsedMs = (participant.currentLapElapsedMs || 0) + deltaTime

      // Check if lap is completed
      if (participant.lapProgress >= 100) {
        this.completeLap(participant)
      }

      // Update lap time display
      participant.lapTime = this.formatTime(participant.currentLapElapsedMs || 0)
    })

    // Update positions based on progress
    this.updatePositions()
    
    // Check if race is finished
    this.checkRaceFinish()
    
    // Save race state to localStorage
    this.saveRaceState()
    
    // Notify listeners with cloned state
    this.callbacks.onRaceUpdate?.(JSON.parse(JSON.stringify(this.raceState)))
    
    // Debug logging
    console.log('Race update:', {
      status: this.raceState.status,
      participants: this.raceState.participants.map(p => ({
        name: p.username,
        lap: p.currentLap,
        progress: p.lapProgress.toFixed(2),
        position: p.position
      }))
    })
  }

  // calculateBaseSpeed no longer used; progress is driven by planned lap ms

  private completeLap(participant: RaceParticipant) {
    const lapTime = participant.currentLapElapsedMs ?? this.calculateCurrentLapTime(participant)
    
    // Add lap time to history
    participant.lapTimes.push(lapTime)
    this.raceState.lapTimes[participant.id].push(lapTime)
    
    // Update best lap if this is better
    if (participant.bestLap === '0:00.000' || lapTime < this.parseTime(participant.bestLap)) {
      participant.bestLap = this.formatTime(lapTime)
    }
    
    // Move to next lap
    participant.currentLap++
    participant.lapProgress = 0
    participant.lastLapTime = lapTime
    participant.currentLapPlannedMs = this.computePlannedLapMs(participant)
    participant.currentLapElapsedMs = 0
    
    // Notify lap completion
    this.callbacks.onLapComplete?.(participant.id, participant.currentLap - 1, lapTime)
    
    // Check if this participant finished the race
    if (participant.currentLap > this.raceState.totalLaps) {
      participant.finished = true
      participant.currentLap = this.raceState.totalLaps
      participant.lapProgress = 100 // Mark as fully completed
      // Assign finish order (locks position precedence)
      ;(participant as any).finishOrder = ++this.finishCounter
    }
  }

  private updatePositions() {
    // Sort with finish lock: finished first by finishOrder, then active by progress, retired last
    const sorted = [...this.raceState.participants].sort((a: any, b: any) => {
      const aFinished = Boolean(a.finished)
      const bFinished = Boolean(b.finished)
      const aRet = Boolean(a.retired)
      const bRet = Boolean(b.retired)

      // Finished always before non-finished
      if (aFinished && !bFinished) return -1
      if (!aFinished && bFinished) return 1
      if (aFinished && bFinished) {
        const ao = a.finishOrder ?? Infinity
        const bo = b.finishOrder ?? Infinity
        return ao - bo
      }

      // Among non-finished: non-retired before retired
      if (aRet && !bRet) return 1
      if (!aRet && bRet) return -1
      if (aRet && bRet) {
        return (a.currentLap - b.currentLap)
      }

      // Active sorting
      if (a.currentLap !== b.currentLap) return b.currentLap - a.currentLap
      if (Math.abs(a.lapProgress - b.lapProgress) > 0.1) return b.lapProgress - a.lapProgress

      const aBestLap = a.lapTimes.length > 0 ? Math.min(...a.lapTimes) : Infinity
      const bBestLap = b.lapTimes.length > 0 ? Math.min(...b.lapTimes) : Infinity
      if (aBestLap !== bBestLap) return aBestLap - bBestLap

      const aTotalTime = a.lapTimes.reduce((sum: number, time: number) => sum + time, 0)
      const bTotalTime = b.lapTimes.reduce((sum: number, time: number) => sum + time, 0)
      return aTotalTime - bTotalTime
    })

    // Update positions and gaps
    sorted.forEach((participant, index) => {
      const newPosition = index + 1
      const oldPosition = participant.position
      
      if (newPosition !== oldPosition) {
        participant.position = newPosition
        this.callbacks.onPositionChange?.(participant.id, newPosition)
      }

      // Calculate gap to leader
      if (newPosition === 1) {
        participant.gap = '--'
      } else {
        const leader = sorted[0]
        const gap = this.calculateGap(participant, leader)
        participant.gap = `+${gap.toFixed(3)}`
      }
    })
  }

  private calculateGap(participant: RaceParticipant, leader: RaceParticipant): number {
    // If participant is DNF/retired or leader finished and participant not, gap is not meaningful
    if (participant.retired || participant.dnf) return Number.NaN
    if (leader.finished && !participant.finished) return Number.NaN
    if (participant.currentLap < leader.currentLap) {
      // Represent more-than-a-lap gap as NaN for '--'
      return Number.NaN
    }
    
    const leaderProgress = leader.lapProgress
    const participantProgress = participant.lapProgress
    
    // Convert progress difference to time gap using planned lap time for this participant
    const progressDiff = leaderProgress - participantProgress
    const effectiveMs = participant.currentEffectiveLapMs || participant.currentLapPlannedMs || 60000
    return (progressDiff / 100) * effectiveMs / 1000 // seconds
  }

  private checkRaceFinish() {
    // Check if all participants have completed all laps
    const allFinished = this.raceState.participants.every(p => 
      p.retired || p.finished || (p.currentLap > this.raceState.totalLaps)
    )
    
    if (allFinished) {
      this.raceState.status = 'finished'
      this.raceState.endTime = Date.now()
      // Ensure final ordering/positions
      this.updatePositions()
      // Assign points and tokens based on final positions
      this.assignPointsAndTokens()
      
      this.stopSimulation()
      this.callbacks.onRaceFinished?.(this.raceState)
    }
  }

  private computePlannedLapMs(participant: RaceParticipant): number {
    // Use emergent formula to derive a baseline lap plan; actual per-tick uses computeEffectiveLapMs
    return this.computeEffectiveLapMs(participant)
  }

  private calculateCurrentLapTime(participant: RaceParticipant): number {
    // Emergent: current elapsed milliseconds is authoritative
    return participant.currentLapElapsedMs || 0
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  private parseTime(timeString: string): number {
    const [minutes, seconds] = timeString.split(':')
    const [secs, ms] = seconds.split('.')
    return (parseInt(minutes) * 60 + parseInt(secs)) * 1000 + parseInt(ms) * 10
  }

  public stopSimulation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  public getRaceState(): RaceState {
    return JSON.parse(JSON.stringify(this.raceState))
  }

  public onRaceUpdate(callback: (state: RaceState) => void) {
    this.callbacks.onRaceUpdate = callback
  }

  public onLapComplete(callback: (participantId: string, lap: number, lapTime: number) => void) {
    this.callbacks.onLapComplete = callback
  }

  public onPositionChange(callback: (participantId: string, newPosition: number) => void) {
    this.callbacks.onPositionChange = callback
  }

  public onRaceFinished(callback: (finalState: RaceState) => void) {
    this.callbacks.onRaceFinished = callback
  }

  public destroy() {
    this.stopSimulation()
  }

  private saveRaceState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.raceState))
    } catch (error) {
      console.warn('Failed to save race state to localStorage:', error)
    }
  }

  private loadRaceState(): RaceState | null {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Check if race is still valid (not too old)
        if (parsed.startTime && Date.now() - parsed.startTime < 300000) { // 5 minutes max
          return parsed
        } else {
          // Clear old race data
          localStorage.removeItem(this.storageKey)
        }
      }
    } catch (error) {
      console.warn('Failed to load race state from localStorage:', error)
    }
    return null
  }

  private calculatePointsAndTokens(position: number): { points: number, tokens: number } {
    // F1-style points system
    const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] // Top 10 get points
    const points = position <= 10 ? pointsTable[position - 1] : 0
    
    // Tokens based on position (more tokens for better positions)
    const tokensTable = [50, 40, 35, 30, 25, 20, 15, 10, 8, 5] // Top 10 get tokens
    const tokens = position <= 10 ? tokensTable[position - 1] : 2 // Everyone gets at least 2 tokens
    
    return { points, tokens }
  }

  private calculateDNFProbability(participant: RaceParticipant): number {
    const car = participant.car
    
    // DNF Probability Formula (reduced base to lower overall DNF rate)
    // Base Rate = 0.02 (2% base DNF chance)
    const baseRate = 0.02
    
    // Condition Factor = 2^((100 - Condition) ÷ 20)
    const conditionFactor = Math.pow(2, (100 - car.condition) / 20)
    
    // Reliability Factor = (110 - Car Durability) ÷ 100
    const reliabilityFactor = (110 - car.stats.durability) / 100
    
    // Distance Factor = Race Distance (1.0 for normal race)
    const distanceFactor = 1.0
    
    // DNF Probability = Base Rate × Condition Factor × Reliability Factor × Distance Factor
    let dnfProbability = baseRate * conditionFactor * reliabilityFactor * distanceFactor
    
    // Maximum DNF Probability = 0.2 (capped at 20%)
    dnfProbability = Math.min(dnfProbability, 0.2)
    
    return dnfProbability
  }

  // Tick-level DNF probability derived from crash/failure/blowout chances
  private calculateTickDNFProbability(participant: RaceParticipant): number {
    const d = participant.driver.stats
    const c = participant.car
    // Crash chance - significantly reduced
    const crashChance = ((d.aggression - 50) * (100 - d.composure)) / 50000 * this.randBetween(0.3, 0.7)
    // Mechanical failure - much lower base rate
    const failureChance = ((100 - c.stats.durability) * (100 - c.condition)) / 100000 * this.randBetween(0.3, 0.7)
    // Tire blowout if over 100% wear (we treat tireRemaining falling under 0)
    const tireOver = Math.max(0, 100 - (participant.tireRemaining ?? 100))
    const blowoutChance = (tireOver) / 10000 * this.randBetween(0.3, 0.7)
    // Combine conservatively with much lower overall probability
    const total = crashChance + failureChance + blowoutChance
    return Math.max(0, Math.min(0.001, total)) // cap 0.1% per tick (very low)
  }

  private randBetween(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }

  // Effective lap time based on simulation formula.txt
  private computeEffectiveLapMs(participant: RaceParticipant): number {
    const d = participant.driver.stats
    const c = participant.car.stats
    const condition = participant.car.condition
    // Driver performance (using provided mapping emphasis)
    const driverPerformance = (d.cornering * 0.25) + (d.aggression * 0.15) + (d.composure * 0.20)
    // Car performance (speed/accel/brake/aero/grip emphasis)
    const carPerformance = (c.speed * 0.25) + (c.acceleration * 0.20) + (c.braking * 0.15) + (c.aero * 0.15) + (c.grip * 0.15)
    // Fuel penalty: approximate fuelRemaining (start 100, drops per tick)
    if (participant.fuelRemaining === undefined) participant.fuelRemaining = 100
    if (participant.tireRemaining === undefined) participant.tireRemaining = 100
    const fuelEff = c.fuel
    const fuelPenalty = (100 - (participant.fuelRemaining)) * (1 - fuelEff / 200)
    // Tire penalty: remaining tread impacts
    const tirePenalty = (100 - (participant.tireRemaining)) * (1 - c.grip / 200)
    // Durability/condition penalty
    const durabilityPenalty = (100 - condition) * (1 - c.durability / 200)
    // Lap RNG with composure scaling
    const lapRng = (Math.random() * 2 - 1) * (1 - d.composure / 100)
    // Base lap time constant (55s baseline adjusted down/up). We'll target 45-60 range after scaling
    const BLT = 55000
    let lapMs = BLT - (driverPerformance + carPerformance) * 80 + (fuelPenalty + tirePenalty + durabilityPenalty) * 20 + lapRng * 500
    // Clamp 45s - 60s
    lapMs = Math.max(45000, Math.min(60000, lapMs))
    // Degrade resources per tick proportionally to progress made
    // const tickProgress = 1000 / lapMs // fraction of lap per 1s (not used explicitly)
    participant.fuelRemaining = Math.max(0, (participant.fuelRemaining ?? 100) - (0.8 - (c.fuel / 200)) )
    participant.tireRemaining = Math.max(0, (participant.tireRemaining ?? 100) - (0.7 - (c.tireWear / 200)) )
    // Slight condition degradation
    participant.car.condition = Math.max(0, participant.car.condition - 0.05)
    return lapMs
  }


  private assignPointsAndTokens() {
    // Use participant.position (already set by updatePositions)
    this.raceState.participants.forEach((participant) => {
      const position = participant.position
      const { points, tokens } = this.calculatePointsAndTokens(position)
      participant.earnedPoints = points
      participant.earnedTokens = tokens
      participant.dnf = participant.retired
    })
  }

  public clearRaceState() {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('Failed to clear race state from localStorage:', error)
    }
  }
}