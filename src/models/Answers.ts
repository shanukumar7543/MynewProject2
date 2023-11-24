import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface AnswersModelData {
  stepId: Schema.Types.ObjectId;
  answerType: Schema.Types.ObjectId;
  answers: {
    category: string;
    responseType: string;
    text: string;
  };
  nextStepId: Schema.Types.ObjectId;
  contactDetails: boolean;
  timeLimit: number;
  delayInteraction: number;
  multipleSelection: boolean;
  randomize: boolean;
  skipDataCollection: boolean;
  showOptionCount: boolean;
  appointmentLink: string;
  schedulingTool: string;
  worksWith: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnswersModel extends AnswersModelData, Document {}

const AnswersSchema: Schema = new Schema(
  {
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'Steps',
      required: false,
    },
    answerType: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    answers: {
      category: {
        type: String,
        enum: ['OPEN_ENDED', 'BUTTON', 'MULTICHOICE', 'CALENDLY', 'INPUT'],
        required: false,
      },
      responseType: {
        type: String,
        required: false,
      },
      text: {
        type: String,
        required: false,
      },
    },
    nextStepId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    timeLimit: {
      type: Number,
      requires: false,
    },

    delayInteraction: {
      type: Number,
      requires: false,
    },

    multipleSelection: {
      type: Boolean,
      requires: false,
    },

    randomize: {
      type: Boolean,
      requires: false,
    },

    skipDataCollection: {
      type: Boolean,
      requires: false,
    },

    showOptionCount: {
      type: Boolean,
      requires: false,
    },

    appointmentLink: {
      type: String,
      requires: false,
    },

    schedulingTool: {
      type: String,
      requires: false,
    },

    worksWith: {
      type: String,
      requires: false,
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

const Answer = mongoose.model<AnswersModel>('Answers', AnswersSchema);
export default Answer;
