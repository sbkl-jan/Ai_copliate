import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  businessId: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string;
  firebaseUid?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee' | 'customer';
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  setPassword(password: string): void;
  comparePassword(password: string): boolean;
}

const UserSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    firebaseUid: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'employee', 'customer'], 
      default: 'customer', 
      required: true 
    },
    phoneNumber: { type: String, trim: true },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ businessId: 1 });

// Helper to hash passwords using pbkdf2 from crypto
UserSchema.methods.setPassword = function (password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  this.passwordHash = `${salt}:${hash}`;
};

UserSchema.methods.comparePassword = function (password: string): boolean {
  if (!this.passwordHash) return false;
  const [salt, storedHash] = this.passwordHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
};

export default mongoose.model<IUser>('User', UserSchema);
