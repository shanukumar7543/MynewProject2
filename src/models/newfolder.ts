import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface Ifolder {
  organizationID: Schema.Types.ObjectId;
  name: string;
  useraccess: any;
  default: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Newfolder extends Ifolder, Document {}

const FolderSchema = new Schema<Newfolder>(
  {
    organizationID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    useraccess: [
      {
        userid: {
          type: Schema.Types.ObjectId,
          ref: 'user',
        },
        access: {
          type: String,
          enum: ['write', 'read'],
        },
      },
    ],
    default: {
      type: Boolean,
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

const Folder = model<Newfolder>('Folder', FolderSchema);

export default Folder;

Folder.findOne({
  name: {
    $regex: /default/i,
  },
}).populate(['user']);
