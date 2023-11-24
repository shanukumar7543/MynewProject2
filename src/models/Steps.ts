import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface StepsModelData {
  userId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  vidychatId: Schema.Types.ObjectId;
  prev: Schema.Types.ObjectId;
  next: Schema.Types.ObjectId;
  videoDetails: {
    S3Link: {
      fileName: string;
      url: string;
      bucket: string;
    };
  };
  thumbnail: [
    {
      S3Link: {
        fileName: string;
        url: string;
        bucket: string;
      };
      isSelected: boolean;
    }
  ];
  createdAt?: Date;
  updatedAt?: Date;
  positions: {
    x: number;
    y: number;
  };
}

export interface StepsModel extends StepsModelData, Document {}

const StepsSchema: Schema = new Schema(
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

    videoDetails: {
      S3Link: {
        fileName: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
        bucket: {
          type: String,
          required: false,
        },
      },
    },
    thumbnail: [
      {
        S3Link: {
          fileName: {
            type: String,
            required: false,
          },
          url: {
            type: String,
            required: false,
          },
          bucket: {
            type: String,
            required: false,
          },
        },
        isSelected: {
          type: Boolean,
          required: false,
        },
      },
    ],
    vidychatId: {
      type: Schema.Types.ObjectId,
      ref: 'VidyChat',
      required: false,
    },
    position: {
      x: Number,
      y: Number,
    },
    stepType: {
      type: String,
      enum: ['INPUT', 'CUSTOM', 'OUTPUT'],
      // default: 'CUSTOM',
      required: false,
    },

    prev: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    next: {
      type: Schema.Types.ObjectId,
      required: false,
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

const Steps = mongoose.model<StepsModel>('Steps', StepsSchema);
export default Steps;
