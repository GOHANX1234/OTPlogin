import mongoose, { Document, Schema } from 'mongoose';

export interface IKey extends Document {
  id: number;
  keyString: string;
  game: string;
  resellerId: number;
  createdAt: Date;
  expiryDate: Date;
  deviceLimit: number;
  isRevoked: boolean;
}

const keySchema = new Schema<IKey>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  keyString: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  game: {
    type: String,
    required: true,
    enum: ["PUBG MOBILE", "LAST ISLAND OF SURVIVAL", "STANDOFF2"],
  },
  resellerId: {
    type: Number,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  deviceLimit: {
    type: Number,
    required: true,
    min: 1,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'keys'
});

// Index for efficient queries
keySchema.index({ resellerId: 1, isRevoked: 1 });
keySchema.index({ expiryDate: 1, isRevoked: 1 });

export const Key = mongoose.model<IKey>('Key', keySchema);