import mongoose, { Schema, Document } from 'mongoose'

export interface IRaceResult {
  userId: string
  position: number
  points: number
  time: number
  fastestLap: boolean
}

export interface IRace extends Document {
  name: string
  track: string
  startTime: Date
  participants: string[] // User IDs
  results?: IRaceResult[]
  status: 'scheduled' | 'in-progress' | 'completed'
}

const RaceResultSchema = new Schema<IRaceResult>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  position: {
    type: Number,
    required: true,
    min: 1
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  time: {
    type: Number,
    required: true,
    min: 0
  },
  fastestLap: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const RaceSchema = new Schema<IRace>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  track: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  participants: [{
    type: String,
    ref: 'User'
  }],
  results: [RaceResultSchema],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled'
  }
}, {
  timestamps: true
})

export const Race = mongoose.model<IRace>('Race', RaceSchema)
