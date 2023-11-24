import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IBrand extends Document {
  organizationId: string;
  name: string;
  image: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBrand>('Brand', BrandSchema);
