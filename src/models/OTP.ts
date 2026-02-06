import mongoose, { Schema, Document } from 'mongoose'

export interface IOTP extends Document {
  email: string
  otp: string
  purpose: 'registration' | 'login' | 'password-reset'
  expiresAt: Date
  verified: boolean
  attempts: number
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'password-reset'],
      default: 'registration',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete when expired
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster lookups
OTPSchema.index({ email: 1, purpose: 1 })

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
