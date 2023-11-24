import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface IInvite {
  email: string;
  userId: Schema.Types.ObjectId;
  role: string;
  folder: any;
  sender: Schema.Types.ObjectId;
  organization: Schema.Types.ObjectId;
  status?: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

interface IteamsInvite extends IInvite, Document {}

const InviteSchema: Schema<IteamsInvite> = new Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MEMBER'],
    // default: '',
    required: true,
  },
  folder: [
    {
      id: String,
      access: {
        type: String,
        enum: ['write', 'read'],
      },
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },

  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'organization',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'PENDING'],
    default: 'PENDING',
    required: true,
  },
  acceptedAt: {
    type: Date,
  },
});

const Invite = model<IteamsInvite>('invite', InviteSchema);

export default Invite;
