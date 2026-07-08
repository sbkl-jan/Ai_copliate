import mongoose, { Schema, Document } from 'mongoose';

export interface IAIMemory extends Document {
  businessId: mongoose.Types.ObjectId;
  entityId: string; // Identifier: e.g. Customer Email or Phone
  entityType: 'customer' | 'lead' | 'employee';
  facts: string[];
  preferences: Record<string, any>;
  lastInteractionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIMemorySchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    entityId: { type: String, required: true, trim: true },
    entityType: {
      type: String,
      enum: ['customer', 'lead', 'employee'],
      required: true,
    },
    facts: [{ type: String }],
    preferences: { type: Schema.Types.Map, of: Schema.Types.Mixed, default: {} },
    lastInteractionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AIMemorySchema.index({ businessId: 1, entityId: 1 }, { unique: true });

export default mongoose.model<IAIMemory>('AIMemory', AIMemorySchema);
