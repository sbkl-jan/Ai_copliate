import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  businessId: mongoose.Types.ObjectId;
  participants: {
    id: string; // User ID or guest string
    role: 'customer' | 'employee' | 'agent';
  }[];
  channel: 'web' | 'whatsapp' | 'voice';
  status: 'active' | 'archived' | 'pending_human';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    participants: [
      {
        id: { type: String, required: true },
        role: {
          type: String,
          enum: ['customer', 'employee', 'agent'],
          required: true,
        },
      },
    ],
    channel: {
      type: String,
      enum: ['web', 'whatsapp', 'voice'],
      default: 'web',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'pending_human'],
      default: 'active',
      required: true,
    },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ChatSchema.index({ businessId: 1 });
ChatSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
