import mongoose, { Schema, Document } from 'mongoose';

// ------------------------------------------------------------------------------
// 1. APPOINTMENT MODEL
// ------------------------------------------------------------------------------
export interface IAppointment extends Document {
  businessId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: string;
  source: string;
  reminderSent: boolean;
}

const AppointmentSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  source: { type: String, default: 'manual' },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

// ------------------------------------------------------------------------------
// 2. NOTIFICATION MODEL
// ------------------------------------------------------------------------------
export interface INotification extends Document {
  businessId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: string;
  priority: string;
  status: string;
  channels: string[];
}

const NotificationSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, required: true },
  recipientId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  status: { type: String, default: 'unread' },
  channels: [{ type: String }],
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// ------------------------------------------------------------------------------
// 3. TASK MODEL
// ------------------------------------------------------------------------------
export interface ITask extends Document {
  workflowId: mongoose.Types.ObjectId;
  name: string;
  status: string;
  assignedToAgent: string;
  inputParams: Record<string, any>;
  outputResult?: Record<string, any>;
  errorLog?: string;
  dependsOn?: mongoose.Types.ObjectId[];
}

const TaskSchema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  status: { type: String, default: 'pending' },
  assignedToAgent: { type: String, required: true },
  inputParams: { type: Schema.Types.Map, of: Schema.Types.Mixed, default: {} },
  outputResult: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  errorLog: { type: String },
  dependsOn: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', TaskSchema);

// ------------------------------------------------------------------------------
// 4. WORKFLOW MODEL
// ------------------------------------------------------------------------------
export interface IWorkflow extends Document {
  businessId: mongoose.Types.ObjectId;
  initiator: {
    type: string;
    id: string;
  };
  triggerInput: string;
  status: string;
  currentStepIndex: number;
  steps: mongoose.Types.ObjectId[];
}

const WorkflowSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, required: true },
  initiator: {
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  triggerInput: { type: String, required: true },
  status: { type: String, default: 'initiated' },
  currentStepIndex: { type: Number, default: 0 },
  steps: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
}, { timestamps: true });

export const Workflow = mongoose.model<IWorkflow>('Workflow', WorkflowSchema);

// ------------------------------------------------------------------------------
// 5. DOCUMENT MODEL
// ------------------------------------------------------------------------------
export interface IDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  ocrStatus: string;
  extractedText?: string;
  parsedData?: Record<string, any>;
  summary?: string;
  tags: string[];
}

const DocumentSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  storageUrl: { type: String, required: true },
  ocrStatus: { type: String, default: 'pending' },
  extractedText: { type: String },
  parsedData: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  summary: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
export { DocumentModel as Document };
