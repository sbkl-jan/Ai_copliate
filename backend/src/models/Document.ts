import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  parsedData?: Record<string, any>;
  summary?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true, trim: true },
    storageUrl: { type: String, required: true },
    ocrStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    extractedText: { type: String },
    parsedData: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    summary: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

DocumentSchema.index({ businessId: 1 });
DocumentSchema.index({ tags: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
