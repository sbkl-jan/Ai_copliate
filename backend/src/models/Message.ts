import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: {
    id?: mongoose.Types.ObjectId;
    role: 'customer' | 'employee' | 'agent';
    name: string;
  };
  content: string;
  contentType: 'text' | 'voice' | 'attachment';
  attachmentUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      role: {
        type: String,
        enum: ['customer', 'employee', 'agent'],
        required: true,
      },
      name: { type: String, required: true },
    },
    content: { type: String, required: true },
    contentType: {
      type: String,
      enum: ['text', 'voice', 'attachment'],
      default: 'text',
      required: true,
    },
    attachmentUrl: { type: String },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
