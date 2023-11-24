import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

interface S3Link {
  url: string;
  filename: string;
  bucket: string;
}

export interface IContact {
  name: string;
  email: string;
  phone?: string;
}

export interface IInteraction {
  vidyChatId?: string;
  answers?: {
    stepId: string;
    answerId: string;
    nextStepId: string;
    answer:
      | {
          category: 'MULTIPLE_CHOICE' | 'BUTTON';
          selected: string;
        }
      | ({ category: 'OPEN_ENDED' } & (
          | {
              responseType: 'text';
              text: string;
            }
          | {
              responseType: 'video' | 'audio';
              S3Link: S3Link;
            }
        ));
  }[];
  contact?: IContact;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InteractionData extends IInteraction, Document {}

const InteractionSchema = new Schema<InteractionData>(
  {
    vidyChatId: {
      type: Schema.Types.ObjectId,
      ref: 'VidyChat',
      required: true,
    },
    answers: [
      {
        stepId: {
          type: Schema.Types.ObjectId,
          ref: 'Step',
          required: true,
        },
        answerId: {
          type: Schema.Types.ObjectId,
          ref: 'Answer',
          required: true,
        },
        nextStepId: {
          type: Schema.Types.ObjectId,
          ref: 'Step',
          required: true,
        },
        answer: {
          category: {
            type: String,
            enum: ['MULTIPLE_CHOICE', 'BUTTON', 'OPEN_ENDED'],
            required: true,
          },
          selected: {
            type: String,
            required: false,
          },
          responseType: {
            type: String,
            enum: ['text', 'video', 'audio'],
            required: false,
          },
          text: {
            type: String,
            required: false,
          },
          S3Link: {
            url: {
              type: String,
              required: false,
            },
            filename: {
              type: String,
              required: false,
            },
            bucket: {
              type: String,
              required: false,
            },
          },
        },
      },
    ],
    contact: {
      name: {
        type: String,
        required: false,
        default: 'Anonymous',
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
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

const Interaction = model<InteractionData>('Interaction', InteractionSchema);

export default Interaction;
