import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface Iteams {
  organizationID: string;
  name: string;
  email:string;
  totalMember:string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Teams extends Iteams, Document {}

const TeamsSchema = new Schema<Teams>(
  {
    organizationID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
        type: String,
        required: true,
      },
    createdAt: {
      type: Date,
      required: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
  },
  { timestamps: true }
);

const Teams = model<Teams>('Teams', TeamsSchema);

export default Teams;
