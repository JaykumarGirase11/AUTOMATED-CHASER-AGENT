import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReminderLog extends Document {
  _id: mongoose.Types.ObjectId
  taskId: mongoose.Types.ObjectId
  taskTitle: string
  recipientEmail: string
  recipientName: string
  channel: 'email' | 'slack' | 'push'
  messageType: 'scheduled' | 'manual' | 'escalation'
  tone: 'friendly' | 'firm' | 'urgent' | 'escalation'
  subject: string
  message: string
  isAIGenerated: boolean
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  errorMessage?: string
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  respondedAt?: Date
  reminderNumber: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ReminderLogSchema = new Schema<IReminderLog>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  taskTitle: {
    type: String,
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'slack', 'push'],
    default: 'email',
  },
  messageType: {
    type: String,
    enum: ['scheduled', 'manual', 'escalation'],
    default: 'scheduled',
  },
  tone: {
    type: String,
    enum: ['friendly', 'firm', 'urgent', 'escalation'],
    default: 'friendly',
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending',
  },
  errorMessage: String,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  respondedAt: Date,
  reminderNumber: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

// Indexes for efficient queries
ReminderLogSchema.index({ taskId: 1, createdAt: -1 })
ReminderLogSchema.index({ createdBy: 1, createdAt: -1 })
ReminderLogSchema.index({ status: 1, createdAt: -1 })
ReminderLogSchema.index({ recipientEmail: 1 })

const ReminderLog: Model<IReminderLog> = mongoose.models.ReminderLog || mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema)

export default ReminderLog
