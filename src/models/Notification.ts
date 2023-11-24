import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface Notification {
  userID: Schema.Types.ObjectId;
  content: string;
  status: string;
  createdAt: Date;
  documentId: Schema.Types.ObjectId;
  documentName: string;
}

interface NotificationDocument extends Notification, Document {}

const NotificationSchema: Schema<NotificationDocument> = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },

  content: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['READ', 'UNREAD'],
    default: 'UNREAD',
    required: true,
  },
  documentId: {
    type: String,
  },

  documentName: {
    type: String,
    required: true,
  },
});

const Invite = model<NotificationDocument>('notification', NotificationSchema);

export default Invite;
