import mongoose, { Schema, Document } from 'mongoose'

export interface ICar extends Document {
  userId: string
  name: string
  stats: {
    speed: number
    acceleration: number
    braking: number
    aero: number
    fuel: number
    tireWear: number
    grip: number
    durability: number
  }
  statPointsAvailable: number
  condition: number
}

const CarSchema = new Schema<ICar>({
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
    speed: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    acceleration: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    braking: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    aero: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    fuel: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    tireWear: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    grip: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    durability: {
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
  },
  condition: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
})

export const Car = mongoose.model<ICar>('Car', CarSchema)
