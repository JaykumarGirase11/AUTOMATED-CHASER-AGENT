import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComment {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  userName: string
  content: string
  mentions: string[]
  createdAt: Date
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  assigneeName: string
  assigneeEmail: string
  deadline: Date
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'todo' | 'in-progress' | 'completed' | 'overdue'
  tags: string[]
  category?: string
  createdBy: mongoose.Types.ObjectId
  reminderCount: number
  lastReminderSent?: Date
  nextReminderScheduled?: Date
  completedAt?: Date
  comments: IComment[]
  dependencies: mongoose.Types.ObjectId[]
  isDelayRisk: boolean
  delayRiskScore: number
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  mentions: [String],
  createdAt: { type: Date, default: Date.now },
})

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  assigneeName: {
    type: String,
    required: [true, 'Assignee name is required'],
    trim: true,
  },
  assigneeEmail: {
    type: String,
    required: [true, 'Assignee email is required'],
    lowercase: true,
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'todo', 'in-progress', 'completed', 'overdue'],
    default: 'pending',
  },
  tags: [{ type: String, trim: true }],
  category: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reminderCount: {
    type: Number,
    default: 0,
  },
  lastReminderSent: Date,
  nextReminderScheduled: Date,
  completedAt: Date,
  comments: [CommentSchema],
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  isDelayRisk: {
    type: Boolean,
    default: false,
  },
  delayRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
TaskSchema.index({ createdBy: 1, status: 1 })
TaskSchema.index({ deadline: 1 })
TaskSchema.index({ assigneeEmail: 1 })

// Virtual to check if overdue
TaskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && new Date(this.deadline) < new Date()
})

// Update status to overdue if deadline passed
TaskSchema.pre('save', function(next) {
  if (this.status !== 'completed' && new Date(this.deadline) < new Date()) {
    this.status = 'overdue'
  }
  next()
})

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)

export default Task
