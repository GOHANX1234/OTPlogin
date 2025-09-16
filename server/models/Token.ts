import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  id: number;
  token: string;
  createdAt: Date;
  usedBy: string | null;
  isUsed: boolean;
  credits: number;
}

const tokenSchema = new Schema<IToken>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  usedBy: {
    type: String,
    default: null,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  credits: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  collection: 'tokens'
});

// Index for efficient queries
tokenSchema.index({ isUsed: 1 });

export const Token = mongoose.model<IToken>('Token', tokenSchema);