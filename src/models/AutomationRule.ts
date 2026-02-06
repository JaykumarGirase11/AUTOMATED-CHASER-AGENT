import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITrigger {
  type: string
  conditions?: Record<string, any>
}

export interface IAction {
  type: string
  params?: Record<string, any>
}

export interface IAutomationRule extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description?: string
  isActive: boolean
  trigger: ITrigger
  actions: IAction[]
  createdBy: mongoose.Types.ObjectId
  executionCount: number
  lastExecutedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TriggerSchema = new Schema<ITrigger>({
  type: {
    type: String,
    required: true,
  },
  conditions: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false })

const ActionSchema = new Schema<IAction>({
  type: {
    type: String,
    required: true,
  },
  params: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false })

const AutomationRuleSchema = new Schema<IAutomationRule>({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  trigger: TriggerSchema,
  actions: [ActionSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  executionCount: {
    type: Number,
    default: 0,
  },
  lastExecutedAt: Date,
}, {
  timestamps: true,
})

// Index for efficient queries
AutomationRuleSchema.index({ createdBy: 1, isActive: 1 })

const AutomationRule: Model<IAutomationRule> = mongoose.models.AutomationRule || mongoose.model<IAutomationRule>('AutomationRule', AutomationRuleSchema)

export default AutomationRule
