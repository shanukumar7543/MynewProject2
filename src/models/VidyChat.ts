import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import { defaultSettings } from '@/lib/constants';

const colorValidator = {
  validator: (v: string) => /^#[0-9A-F]{6}$/i.test(v),
  message: (props: any) => `${props.value} is not a valid hex color`,
};

const getColorSchema = (name: string) => ({
  type: String,
  required: false,
  default: defaultSettings.colors[
    name as keyof typeof defaultSettings.colors
  ] as string,
  validate: colorValidator,
});

export interface VidyChatModelData {
  userId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  publicLink: string;
  startStep: Schema.Types.ObjectId;
  endStep: Schema.Types.ObjectId;
  folder: Schema.Types.ObjectId;
  name: string;
  contactDetails: boolean;
  language: string;
  // S3Link: {
  //   fileName: string;
  //   url: string;
  //   bucket: string;
  // };
  // overlaytext: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VidyChatModel extends VidyChatModelData, Document {}

const VidyChatSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
    },
    publicLink: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    contactDetails: {
      type: Boolean,
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    endStep: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    startStep: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    folder: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    settings: {
      branding: {
        name: {
          type: String,
          required: false,
          default: defaultSettings.branding.name,
        },
        image: {
          type: String,
          required: false,
          default: defaultSettings.branding.image,
        },
        url: {
          type: String,
          required: false,
          default: defaultSettings.branding.url,
        },
      },
      language: {
        type: String,
        required: false,
        default: defaultSettings.language,
      },
      colors: {
        primary: getColorSchema('primary'),
        secondary: getColorSchema('secondary'),
        background: getColorSchema('background'),
      },
    },
    createdAt: {
      type: Date,
      required: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
      required: false,
    },
  },

  {
    versionKey: false,
    timestamps: true,
  }
);

const VidyChat = mongoose.model<VidyChatModel>('VidyChat', VidyChatSchema);
export default VidyChat;
