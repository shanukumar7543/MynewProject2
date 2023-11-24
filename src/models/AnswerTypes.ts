import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface AnswerTypesModelData {
  name: string;
  multiLogic: boolean;
  actions: [
    {
      actionType: string;
    }
  ];
  choices: [
    {
      choiceName: string;
    }
  ];
  dynamicAction: string;
  defaultInteraction: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnswerTypesModel extends AnswerTypesModelData, Document {}

const AnswerTypesSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    multiLogic: {
      type: Boolean,
      required: true,
    },
    actions: [
      {
        actionType: {
          type: String,
        },
      },
    ],
    choices: [
      {
        choiceName: {
          type: String,
        },
      },
    ],

    dynamicAction: {
      type: String,
    },

    defaultInteraction: {
      type: String,
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

const AnswerTypes = mongoose.model<AnswerTypesModel>(
  'AnswerTypes',
  AnswerTypesSchema
);
export default AnswerTypes;
