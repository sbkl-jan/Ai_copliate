import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflow extends Document {
  businessId: mongoose.Types.ObjectId;
  initiator: {
    type: 'customer' | 'system' | 'employee';
    id: string; // e.g. User ID or email identifier
  };
  triggerInput: string;
  status: 'initiated' | 'executing' | 'completed' | 'failed' | 'paused';
  currentStepIndex: number;
  steps: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    initiator: {
      type: {
        type: String,
        enum: ['customer', 'system', 'employee'],
        required: true,
      },
      id: { type: String, required: true, trim: true },
    },
    triggerInput: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['initiated', 'executing', 'completed', 'failed', 'paused'],
      default: 'initiated',
      required: true,
    },
    currentStepIndex: { type: Number, default: 0, required: true },
    steps: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

WorkflowSchema.index({ businessId: 1 });
WorkflowSchema.index({ status: 1 });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
