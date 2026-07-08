import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  workflowId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedToAgent: string; // Name of the agent, e.g. 'SchedulerAgent'
  inputParams: Record<string, any>;
  outputResult?: Record<string, any>;
  errorLog?: string;
  dependsOn?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    assignedToAgent: { type: String, required: true, trim: true },
    inputParams: { type: Schema.Types.Map, of: Schema.Types.Mixed, default: {} },
    outputResult: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    errorLog: { type: String },
    dependsOn: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
