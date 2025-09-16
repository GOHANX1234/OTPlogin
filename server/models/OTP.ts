import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  id: number;
  adminId: number;
  otp: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  adminId: {
    type: Number,
    required: true,
    ref: 'Admin',
  },
  otp: {
    type: String,
    required: true,
    length: 6,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 1000), // 1 minute from now
  },
}, {
  timestamps: true,
  collection: 'otps'
});

// Create TTL index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is valid (not used and not expired)
otpSchema.methods.isValid = function(): boolean {
  return !this.isUsed && new Date() < this.expiresAt;
};

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);