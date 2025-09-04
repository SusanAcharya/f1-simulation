import { raceAPI } from './api'

type WebSocketMessage = {
  type: 'race_update' | 'position_change' | 'lap_complete' | 'race_finished'
  data: any
}

type WebSocketCallbacks = {
  onRaceUpdate?: (data: any) => void
  onPositionChange?: (data: any) => void
  onLapComplete?: (data: any) => void
  onRaceFinished?: (data: any) => void
}

class RaceWebSocket {
  private ws: WebSocket | null = null
  private raceId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private callbacks: WebSocketCallbacks = {}
  private isConnecting = false

  constructor(raceId: string, callbacks: WebSocketCallbacks = {}) {
    this.raceId = raceId
    this.callbacks = callbacks
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true
    
    try {
      // For now, we'll simulate WebSocket with polling since we don't have a real WebSocket server
      // In production, this would connect to a real WebSocket endpoint
      this.startPolling()
    } catch (error) {
      console.error('Failed to connect to race WebSocket:', error)
      this.handleReconnect()
    }
  }

  private startPolling() {
    // Simulate real-time updates with polling every 2 seconds
    this.pollInterval = setInterval(async () => {
      try {
        const response = await raceAPI.getRace(this.raceId)
        const race = response.data
        
        if (race.status === 'in-progress') {
          this.callbacks.onRaceUpdate?.(race)
          
          // Simulate position changes
          if (Math.random() > 0.7) {
            this.callbacks.onPositionChange?.({
              raceId: this.raceId,
              timestamp: new Date().toISOString()
            })
          }
          
          // Simulate lap completion
          if (Math.random() > 0.8) {
            this.callbacks.onLapComplete?.({
              raceId: this.raceId,
              lap: Math.floor(Math.random() * 10) + 1,
              timestamp: new Date().toISOString()
            })
          }
        } else if (race.status === 'completed') {
          this.callbacks.onRaceFinished?.(race)
          this.disconnect()
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnecting = false
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    this.reconnectDelay *= 2

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
  }

  // Send message to server (for future use with real WebSocket)
  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private pollInterval: number | null = null
}

export default RaceWebSocket
