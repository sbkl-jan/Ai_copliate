import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  businessId: mongoose.Types.ObjectId;
  date: Date;
  metrics: {
    totalRevenue: number;
    totalLeads: number;
    convertedLeads: number;
    totalAppointments: number;
    cancelledAppointments: number;
    aiHandledQueries: number;
  };
  aiInsights: {
    summary: string;
    recommendations: string[];
    sentimentScore: number;
  };
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, required: true },
    metrics: {
      totalRevenue: { type: Number, default: 0 },
      totalLeads: { type: Number, default: 0 },
      convertedLeads: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 },
      cancelledAppointments: { type: Number, default: 0 },
      aiHandledQueries: { type: Number, default: 0 },
    },
    aiInsights: {
      summary: { type: String, default: '' },
      recommendations: [{ type: String }],
      sentimentScore: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound unique index so we have exactly one document per business per day
AnalyticsSchema.index({ businessId: 1, date: -1 }, { unique: true });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
