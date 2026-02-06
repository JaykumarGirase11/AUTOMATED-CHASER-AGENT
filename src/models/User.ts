import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  avatar?: string
  emailVerified?: boolean
  googleId?: string
  authProvider?: 'email' | 'google'
  role: 'admin' | 'manager' | 'member'
  settings: {
    preferredReminderTime?: string
    timezone: string
    skipWeekends: boolean
    digestMode: boolean
    notificationChannels: {
      email: boolean
      slack: boolean
      push: boolean
    }
    quietHoursStart: number
    quietHoursEnd: number
  }
  stats: {
    tasksCompleted: number
    tasksOnTime: number
    avgResponseTime: number
    badges: string[]
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  avatar: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'member'],
    default: 'member',
  },
  settings: {
    preferredReminderTime: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    skipWeekends: { type: Boolean, default: false },
    digestMode: { type: Boolean, default: false },
    notificationChannels: {
      email: { type: Boolean, default: true },
      slack: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    quietHoursStart: { type: Number, default: 22 },
    quietHoursEnd: { type: Number, default: 8 },
  },
  stats: {
    tasksCompleted: { type: Number, default: 0 },
    tasksOnTime: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    badges: [String],
  },
}, {
  timestamps: true,
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
