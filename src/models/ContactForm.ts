import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface Icontactform {
  vidyChatId: Schema.Types.ObjectId;
  stepId: Schema.Types.ObjectId;
  contactData: [
    {
      label: string;
      labelData: string;
      isRequired: boolean;
    }
  ];
  consent: boolean;
  note: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactFormData extends Icontactform, Document {}

const ContactFormSchema = new Schema<ContactFormData>(
  {
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
        isRequired: {
          type: Boolean,
          required: false,
        },
        isVisible: {
          type: Boolean,
          required: false,
        },
      },
    ],
    consent: {
      type: Boolean,
      required: false,
    },
    note: {
      type: Boolean,
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

const ContactForm = model<ContactFormData>('ContactForm', ContactFormSchema);

export default ContactForm;
