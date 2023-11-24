/* eslint-disable no-underscore-dangle */
import { type Request, type Response } from 'express';
import mongoose from 'mongoose';

import Answer from '@/models/Answers';
import ContactForm from '@/models/ContactForm';
import Organization from '@/models/Organization';
import Steps from '@/models/Steps';
import User from '@/models/User';
// import Notifications from '../models/Notification';
import VidyChat from '@/models/VidyChat';

type ICondition = {
  pass: boolean;
  error: string;
};
const verifyRequest = (res: Response, conditions: ICondition[]) => {
  for (let i = 0; i < conditions.length; i += 1) {
    if (conditions[i]!.pass) {
      return res
        .status(400)
        .json({ success: false, error: conditions[i]!.error });
    }
  }
  return true;
};

// const returnFalse = (res: Response, error: string) =>
//   res.status(400).json({ success: false, error });

export const createVidyChat = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId, name, contactDetails, language, folder } =
      req.body;

    const user = await User.findById(userId);

    const isValid = verifyRequest(res, [
      { pass: !user, error: 'User not found' },
      { pass: !organizationId, error: 'Organization ID is required' },
      { pass: !folder, error: 'Folder ID is required' },
      {
        pass: !user!.organization.find(
          (org) => org.organizationID.toString() === organizationId
        ),
        error: 'You do not belong to this organization',
      },
    ]);

    if (isValid !== true) return isValid;

    // check if organization and folder exists
    const exists = await Organization.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(organizationId) } },
      {
        $lookup: {
          from: 'folders',
          localField: '_id',
          foreignField: 'organizationID',
          as: 'folder',
        },
      },
      {
        $unwind: {
          path: '$folder',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: { 'folder._id': new mongoose.Types.ObjectId(folder) },
      },
    ]);

    if (!exists.length || !exists[0].folder)
      return res
        .status(400)
        .json({ success: false, error: 'Organization or folder not found' });

    const vidyChatData = await VidyChat.create({
      userId,
      organizationId,
      name,
      contactDetails,
      language,
      folder,
    });

    const documents = [
      {
        userId,
        organizationId,
        vidychatId: vidyChatData._id,
        stepType: 'INPUT',
      },
      {
        userId,
        organizationId,
        vidychatId: vidyChatData._id,
        stepType: 'OUTPUT',
      },
    ];

    const stepData = await Steps.insertMany(documents);

    // create default answer table for input
    await Answer.create({
      stepId: stepData[0]?._id,
      answerType: '64c38998f8c4d35fb8fc6a17',
      answers: { category: 'INPUT', responseType: 'default' },
      nextStepId: stepData[1]?._id,
    });
    await VidyChat.updateMany(
      {
        _id: vidyChatData._id,
      },
      {
        $set: {
          startStep: stepData[0]?._id,
          endStep: stepData[1]?._id,
        },
      }
    );
    if (contactDetails) {
      await ContactForm.create({
        vidyChatId: vidyChatData._id,
        contactData: [
          {
            label: 'name',
            labelData: '',
            isRequired: true,
            isVisible: true,
          },
          {
            label: 'email',
            labelData: '',
            isRequired: true,
            isVisible: true,
          },
          {
            label: 'phoneNumber',
            labelData: '',
            isRequired: true,
            isVisible: false,
          },
        ],
      });
    }
    return res.status(200).json({ success: true, data: vidyChatData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

export const getVidychatWithStepsAndAnswers = async (
  req: Request,
  res: Response
) => {
  try {
    const vidychatId = req.params.id;

    const vidyChat = await VidyChat.findById(vidychatId);

    if (!vidyChat) {
      return res
        .status(500)
        .json({ success: false, error: 'Vidychat not found' });
    }
    const vidyChatData = await VidyChat.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(vidychatId) },
      },
      {
        $lookup: {
          from: 'steps',
          localField: '_id',
          foreignField: 'vidychatId',
          as: 'stepsData',
        },
      },
      {
        $unwind: {
          path: '$stepsData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'answers',
          localField: 'stepsData._id',
          foreignField: 'stepId',
          as: 'stepsData.answersData',
        },
      },
      {
        $addFields: {
          stepsData: {
            $mergeObjects: [
              '$stepsData',
              {
                answersData: {
                  $filter: {
                    input: '$stepsData.answersData',
                    as: 'answer',
                    cond: {
                      $eq: ['$$answer.stepId', '$stepsData._id'],
                    },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          organizationId: { $first: '$organizationId' },
          name: { $first: '$name' },
          contactDetails: { $first: '$contactDetails' },
          language: { $first: '$language' },
          updatedAt: { $first: '$updatedAt' },
          createdAt: { $first: '$createdAt' },
          endStep: { $first: '$endStep' },
          startStep: { $first: '$startStep' },
          stepsData: { $push: '$stepsData' },
        },
      },
    ]);
    if (vidyChatData?.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Something went wrong' });
    }

    return res.status(200).json({ success: true, data: vidyChatData[0] });
    // for await (const doc of vidyChatData) {
    // }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error });
  }
};

export const getVidychatById = async (req: Request, res: Response) => {
  try {
    const vidychatId = req.params.id;

    const vidyChat = await VidyChat.findById(vidychatId);

    if (!vidyChat) {
      return res
        .status(500)
        .json({ success: false, error: 'Vidychat not found' });
    }

    return res.status(200).json({ success: true, data: { vidyChat } });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

const getAllVidyChats = async (req: Request, res: Response) => {
  try {
    const { organizationID, folderID } = req.query;

    console.log({ organizationID, folderID });

    const vidyChats = await VidyChat.find({
      folder: folderID,
      organizationId: organizationID,
    });
    console.log(vidyChats);
    if (!vidyChats) {
      return res
        .status(500)
        .json({ success: false, error: 'Vidychat not found' });
    }

    return res.status(200).json({ success: true, data: vidyChats });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

const updateVidyChat = async (req: Request, res: Response) => {
  try {
    const vidyChatId = req.params.id;
    const { name, contactDetails, language, endStep, startStep } = req.body;

    const vidyData = await VidyChat.findById(vidyChatId);

    if (!vidyData) {
      return res
        .status(500)
        .json({ success: false, error: 'Vidychat not found' });
    }

    const updatedData = await VidyChat.findOneAndUpdate(
      { _id: vidyChatId },
      {
        $set: {
          name,
          contactDetails,
          language,
          endStep,
          startStep,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

async function getVidychats() {
  try {
    const vidychatCount = await VidyChat.countDocuments();
    return vidychatCount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Define a route to get the count of total users
export const getVidychat = async (_req: any, res: any) => {
  try {
    const vidychatCount = await getVidychats();
    res.json({ count: vidychatCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  createVidyChat,
  getVidychatWithStepsAndAnswers,
  getVidychatById,
  getAllVidyChats,
  updateVidyChat,
  getVidychat,
};
