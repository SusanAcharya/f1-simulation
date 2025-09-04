import mongoose, { Schema, Document } from 'mongoose'

export interface IDriver extends Document {
  userId: string
  name: string
  stats: {
    cornering: number
    overtaking: number
    defending: number
    aggression: number
    composure: number
  }
  statPointsAvailable: number
}

const DriverSchema = new Schema<IDriver>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  stats: {
    cornering: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    overtaking: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    defending: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    aggression: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    composure: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  statPointsAvailable: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true
})

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema)
