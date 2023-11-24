import mongoose from 'mongoose';

import VidyChat from '@/models/VidyChat';

// const handleValue = (value: any) => (value ? { value } : {});

type Options =
  | {
      steps?: false;
      answers?: false;
    }
  | {
      steps: true;
      answers?: false | true;
    };

export const getVidyChat = async (id: string, options?: Options) => {
  const { answers = false, steps = false } = options ?? {};

  try {
    const res = await VidyChat.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      ...(steps
        ? [
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
          ]
        : []),
      ...(answers
        ? [
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
          ]
        : []),
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

    return res?.length > 0 ? res[0] : null;
  } catch (error: any) {
    return null;
  }
};
