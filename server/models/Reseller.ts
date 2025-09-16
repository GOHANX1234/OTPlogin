import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IReseller extends Document {
  id: number;
  username: string;
  password: string;
  credits: number;
  registrationDate: Date;
  isActive: boolean;
  referralToken: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const resellerSchema = new Schema<IReseller>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    default: 0,
    min: 0,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  referralToken: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'resellers'
});

// Hash password before saving
resellerSchema.pre<IReseller>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
resellerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Reseller = mongoose.model<IReseller>('Reseller', resellerSchema);