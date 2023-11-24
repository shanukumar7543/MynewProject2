import type { Document } from 'mongoose';
import { model, Schema } from 'mongoose';

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

interface IOrganization {
  name: string;
  logo?: {
    bucket: string;
    fileName: string;
    fileUrl: string;
    etag?: string;
  };
  ownedDomain?: string;
  branding?: string;
  language?: string;
  colors?: string;
  font?: string;
  owner?: Schema.Types.ObjectId;
  settings?: {
    branding?: {
      name: string;
      image: string;
      url: string;
    };
    language?: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
    buttonBorderRadius?: number;
    font?: {
      family: string;
      url: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IOrganizationDocument extends IOrganization, Document {}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    ownedDomain: {
      type: String,
      required: false,
    },
    branding: {
      type: String,
      enum: ['VIDYCHAT', 'NONE'],
      default: 'VIDYCHAT',
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    colors: {
      type: String,
      required: false,
    },
    font: {
      type: String,
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
      buttonBorderRadius: {
        type: Number,
        required: false,
        default: defaultSettings.buttonBorderRadius,
      },
      font: {
        family: {
          type: String,
          required: false,
          default: defaultSettings.font.family,
        },
        url: {
          type: String,
          required: false,
          default: defaultSettings.font.url,
        },
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
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

const Organization = model<IOrganizationDocument>(
  'organization',
  OrganizationSchema
);

export default Organization;
