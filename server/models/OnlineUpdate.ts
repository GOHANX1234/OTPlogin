import mongoose, { Document, Schema } from 'mongoose';

export interface IOnlineUpdate extends Document {
  id: number;
  title: string;
  message: string;
  buttonText: string | null;
  linkUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const onlineUpdateSchema = new Schema<IOnlineUpdate>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  },
  buttonText: {
    type: String,
    default: null,
    maxlength: 50,
    trim: true,
  },
  linkUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow null/empty
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Must be a valid URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'online_updates'
});

// Index for efficient queries
onlineUpdateSchema.index({ isActive: 1, createdAt: -1 });

// Update the updatedAt field before saving
onlineUpdateSchema.pre<IOnlineUpdate>('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

export const OnlineUpdate = mongoose.model<IOnlineUpdate>('OnlineUpdate', onlineUpdateSchema);