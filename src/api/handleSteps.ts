/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';
// import VidyChat from '@/models/VidyChat';
import mongoose from 'mongoose';

import Answer from '@/models/Answers';
import Organization from '@/models/Organization';
import Steps from '@/models/Steps';
import User from '@/models/User';

export const addStep = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      organizationId,
      videoDetails,
      vidychatId,
      prev,
      next,
      thumbnail,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }

    const stepData = await Steps.create({
      userId,
      organizationId,
      videoDetails,
      vidychatId,
      // prev,
      // next,
      thumbnail,
      stepType: 'CUSTOM',
    });

    // create default answers for above table

    await Answer.create({
      stepId: stepData?._id,
      answerType: '64c38998f8c4d35fb8fc6a17',
      answers: { category: 'OPEN_ENDED', responseType: 'video' },
      nextStepId: next,
    });

    // find previous steps along with answers

    const prevStepAnswer = await Answer.find({ stepId: prev });

    // update with new stepId

    await Answer.updateMany(
      { _id: { $in: prevStepAnswer.map((el) => el._id) } },
      {
        $set: {
          nextStepId: stepData._id,
        },
      }
    );
    return res.status(201).json({ success: true, stepData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

// export const addStep = async (req: Request, res: Response) => {
//   try {
//     const {
//       userId,
//       organizationId,
//       videoDetails,
//       answerId,
//       vidychatId,
//       positions,
//     } = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, error: 'User not found' });
//     }

//     const organization = await Organization.findById(organizationId);

//     if (!organization) {
//       return res
//         .status(404)
//         .json({ success: false, error: 'Organization not found' });
//     }

//     const checkForSteps = await Steps.find({vidychatId})

//     if(checkForSteps?.length){
//       const stepsData = await Steps.create({
//         userId,
//         organizationId,
//         videoDetails,
//         vidychatId,
//         positions,
//         stepType: "CUSTOM"
//       });
//       if (answerId?.length) {
//         await Answer.updateMany(
//           { _id: { $in: answerId } },
//           {
//             $set: {
//               nextStepId: stepsData._id,
//             },
//           }
//         );
//       }
//       return res.status(200).json({ success: true, data: stepsData });
//     }else{

//       console.log(videoDetails, "detailss")
//       let documents ;
//       if(videoDetails){
//         documents = [
//           { userId , organizationId , vidychatId, stepType: "INPUT",positions},
//           { userId , organizationId , vidychatId, videoDetails ,stepType: "CUSTOM",positions},
//           { userId , organizationId , vidychatId ,stepType: "OUTPUT",positions},
//         ];
//       }else{
//         documents = [
//           { userId , organizationId , vidychatId, stepType: "INPUT",positions},
//           { userId , organizationId , vidychatId ,stepType: "OUTPUT",positions},
//         ];
//       }

//      const stepData = await Steps.insertMany(documents)
//       let answers;
//        // also create  default answer
//        if(stepData.length > 2){
//         answers = [
//           { stepId : stepData[1]?._id , answerType: "64c38998f8c4d35fb8fc6a17" , answers:{ResponseType: "OPEN_ENDED", name:"video" },nextStepId: stepData[2]?._id},
//         ];
//        await Answer.insertMany(answers)
//        await VidyChat.updateMany({
//         _id:vidychatId
//        }, {
//         $set:{
//           endStep: stepData[2]?._id,
//           startStep: stepData[0]?._id
//         }
//        })
//        }else{
//         await VidyChat.updateMany({
//           _id:vidychatId
//          }, {
//           $set:{
//             endStep: stepData[1]?._id,
//             startStep: stepData[0]?._id
//           }
//          })
//        }
//        return res.status(200).json({ success: true, data: stepData });
//     }

//   } catch (error: any) {
//     console.error(error);
//     return res.status(403).json({ success: false, error });
//   }
// };

export const updateStep = async (req: Request, res: Response) => {
  try {
    const stepId = req.params.id;
    const { videoDetails, answerType, prevStepId, nextStepId, position } =
      req.body;

    if (!stepId) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }
    const updatedSteps = await Steps.findOneAndUpdate(
      { _id: stepId },
      {
        $set: {
          videoDetails,
          answerType,
          prevStepId,
          nextStepId,
          position,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedSteps });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

export const updateBulkPositionOfSteps = async (
  req: Request,
  res: Response
) => {
  try {
    const stepUpdates: Array<{
      stepIds: string;
      position: { x: number; y: number };
    }> = req.body;

    if (!stepUpdates || stepUpdates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid input data' });
    }

    // Prepare the bulk update operations
    const updateOperations = stepUpdates.map(({ stepIds, position }) => ({
      updateOne: {
        filter: { _id: stepIds }, // Assuming _id is used as the unique identifier for steps
        update: {
          $set: { position },
          // Add other fields you want to update here
        },
      },
    }));

    const bulkUpdateResult = await Steps.bulkWrite(updateOperations);

    if (bulkUpdateResult.ok) {
      return res.status(200).json({
        success: true,
        message: 'Steps positions updated successfully',
      });
    }
    return res
      .status(500)
      .json({ success: false, error: 'Failed to update steps positions' });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: 'Internal server error' });
  }
};

export const getAllStep = async (_req: Request, res: Response) => {
  try {
    const steps = await Steps.find().sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: { steps } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getStepById = async (req: Request, res: Response) => {
  try {
    const { stepId } = req.body;

    if (!stepId) {
      return res.status(500).json({ success: false, error: 'step not found' });
    }
    // const steps = await Steps.find({ _id: stepId }).populate('stepId');

    const stepsData = await Steps.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(stepId) },
      },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'stepId',
          as: 'answersData',
        },
      },
      {
        $unwind: '$answersData',
      },

      {
        $group: {
          _id: '$_id',
          step: { $first: '$$ROOT' },
          answersData: { $push: '$answersData' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$step', { answersData: '$answersData' }],
          },
        },
      },
    ]);

    if (stepsData?.length === 0) {
      return res
        .status(500)
        .json({ success: false, error: 'Something went wrong' });
    }

    for await (const doc of stepsData) {
      return res.status(200).json({ success: true, data: { doc } });
    }

    // return res.status(200).json({ success: true, data: { steps } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllStepsOfUser = async (req: Request, res: Response) => {
  try {
    const { vidychatId } = req.body;
    const step = await Steps.find({ vidychatId }).sort({
      createdAt: 1,
    });

    const stepId = step.map(async (item) => {
      const answerData = Steps.aggregate([
        {
          $match: { _id: item._id }, // Match the desired step document
        },
        {
          $lookup: {
            from: 'answers', // The target collection (answer collection)
            localField: '_id', // Field in the 'step' collection
            foreignField: 'stepId', // Field in the 'answer' collection
            as: 'answersdata', // New field to store joined answers
          },
        },
        {
          $lookup: {
            from: 'vidychats', // The target collection (vidychat collection)
            localField: 'vidychatId', // Field in the 'step' collection
            foreignField: '_id', // Field in the 'vidychat' collection
            as: 'vidychat', // New field to store joined vidychat data
          },
        },
        {
          $unwind: '$answersdata', // Unwind the answers array
        },
        {
          $unwind: '$vidychat', // Unwind the vidychat array
        },
      ]);
      return answerData;
    });

    console.log(stepId, 'stepID');

    // const answerData = Steps.aggregate([
    //   {
    //     $match: { _id: { $in: stepId } } // Match the desired step document
    //   },
    //   {
    //     $lookup: {
    //       from: "answers", // The target collection (answer collection)
    //       localField: "_id", // Field in the 'step' collection
    //       foreignField: "stepId", // Field in the 'answer' collection
    //       as: "answersdata" // New field to store joined answers
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "vidychats", // The target collection (vidychat collection)
    //       localField: "vidychatId", // Field in the 'step' collection
    //       foreignField: "_id", // Field in the 'vidychat' collection
    //       as: "vidychat" // New field to store joined vidychat data
    //     }
    //   },
    //   {
    //     $unwind: "$answersdata" // Unwind the answers array
    //   },
    //   {
    //     $unwind: "$vidychat" // Unwind the vidychat array
    //   }
    // ]);

    for await (const doc of stepId) {
      console.log(doc, 'dattaa');
      return res.status(200).json({ success: true, data: { doc } });
    }

    // if (!step) {
    //   return res.status(404).json({ success: false, error: 'Step not found' });
    // }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteStep = async (req: Request, res: Response) => {
  try {
    const stepId = req.body;
    if (!stepId) {
      return res
        .status(500)
        .json({ success: false, error: 'step is is required' });
    }
    const steps = await Steps.findByIdAndDelete({ _id: stepId });
    return res.status(200).json({ success: true, data: { steps } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  addStep,
  updateStep,
  getStepById,
  getAllStep,
  deleteStep,
  getAllStepsOfUser,
  updateBulkPositionOfSteps,
};
