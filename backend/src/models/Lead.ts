import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: mongoose.Types.ObjectId;
  value?: number;
  notes: string[];
  aiSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    source: { type: String, default: 'website', trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      default: 'new',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, default: 0 },
    notes: [{ type: String }],
    aiSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ email: 1 });

export default mongoose.model<ILead>('Lead', LeadSchema);
