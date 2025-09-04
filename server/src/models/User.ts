import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  tokens: number
  points: number
  joinedDate: Date
  driverId: string
  carId: string
  profilePic?: number
  carPic?: number
  facility: {
    trainingLevel: number
    warehouseLevel: number
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: {
    type: Number,
    default: 25
  },
  points: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  driverId: {
    type: String,
    required: false
  },
  carId: {
    type: String,
    required: false
  },
  profilePic: {
    type: Number,
    default: 1
  },
  carPic: {
    type: Number,
    default: 1
  },
  facility: {
    trainingLevel: {
      type: Number,
      default: 1
    },
    warehouseLevel: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', UserSchema)
