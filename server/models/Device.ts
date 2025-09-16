import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  id: number;
  keyId: number;
  deviceId: string;
  firstConnected: Date;
}

const deviceSchema = new Schema<IDevice>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  keyId: {
    type: Number,
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    trim: true,
  },
  firstConnected: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'devices'
});

// Compound index to prevent duplicate devices per key
deviceSchema.index({ keyId: 1, deviceId: 1 }, { unique: true });

export const Device = mongoose.model<IDevice>('Device', deviceSchema);