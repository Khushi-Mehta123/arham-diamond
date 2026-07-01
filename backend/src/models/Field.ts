import mongoose, { Schema, Document } from 'mongoose';

export interface IField extends Document {
  name: string; // Machine-friendly key (e.g. "carat", "color")
  label: string; // Human-friendly label (e.g. "Carat Weight", "Color Grade")
  type: 'text' | 'number' | 'select' | 'boolean' | 'image' | 'video' | 'link';
  required: boolean;
  options?: string[]; // Options for select type
  section: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'select', 'boolean', 'image', 'video', 'link'], required: true },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] },
  section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IField>('Field', FieldSchema);
