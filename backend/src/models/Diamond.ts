import mongoose, { Schema, Document } from 'mongoose';

export interface IDiamond extends Document {
  name: string;
  images: string[];
  dynamicData: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DiamondSchema: Schema = new Schema({
  name: { type: String, required: true },
  images: { type: [String], default: [] },
  dynamicData: { type: Map, of: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Create text indexes on standard and dynamic fields if possible, 
// but we will do programmatically constructed regex filters to ensure maximum compatibility.
export default mongoose.model<IDiamond>('Diamond', DiamondSchema);
