import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema: Schema = new Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<ISection>('Section', SectionSchema);
