import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  businessId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: 'appointment' | 'lead' | 'system' | 'mention';
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'failed' | 'sent';
  channels: ('websocket' | 'firebase' | 'email' | 'sms' | 'whatsapp')[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['appointment', 'lead', 'system', 'mention'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'failed', 'sent'],
      default: 'unread',
      required: true,
    },
    channels: [
      {
        type: String,
        enum: ['websocket', 'firebase', 'email', 'sms', 'whatsapp'],
      },
    ],
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, status: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
