import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  domain?: string;
  subscriptionPlan: 'free' | 'growth' | 'enterprise';
  settings: {
    workHours: {
      start: string;
      end: string;
      timezone: string;
    };
    aiConfig: {
      autoSchedule: boolean;
      voiceGreetingName?: string;
      customPromptContext?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'growth', 'enterprise'],
      default: 'free',
      required: true,
    },
    settings: {
      workHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        timezone: { type: String, default: 'UTC' },
      },
      aiConfig: {
        autoSchedule: { type: Boolean, default: true },
        voiceGreetingName: { type: String, default: 'Copilot' },
        customPromptContext: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', BusinessSchema);
