import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no-show' | 'completed';
  assignedTo?: mongoose.Types.ObjectId;
  source: 'chat' | 'voice' | 'manual' | 'portal';
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'no-show', 'completed'],
      default: 'pending',
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    source: {
      type: String,
      enum: ['chat', 'voice', 'manual', 'portal'],
      default: 'manual',
      required: true,
    },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to help quickly find conflicts
AppointmentSchema.index({ businessId: 1, startTime: 1, endTime: 1 });
AppointmentSchema.index({ customerEmail: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
