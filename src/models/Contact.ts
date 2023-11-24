import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface Icontact {
  organizationID: string;
  name: string;
  email: string;
  phone: string;
  favorite?: boolean;
  vidyChatId?: Schema.Types.ObjectId;
  stepId: Schema.Types.ObjectId;
  contactData: [
    {
      label: string;
      labelData: string;
      isRequired: boolean;
    }
  ];
  consent: boolean;
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactData extends Icontact, Document {}

const ContactSchema = new Schema<ContactData>(
  {
    organizationID: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    vidyChatId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    stepId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    contactData: [
      {
        // fields
        label: {
          type: String,
          required: false,
        },
        labelData: {
          type: String,
          required: false,
        },
      },
    ],
    consent: {
      type: Boolean,
      required: false,
    },
    note: {
      type: String,
      required: false,
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

const Contact = model<ContactData>('Contact', ContactSchema);

export default Contact;
