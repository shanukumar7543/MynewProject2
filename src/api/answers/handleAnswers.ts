/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';

import Answer from '@/models/Answers';
import Steps from '@/models/Steps';

export const addAnswer = async (req: Request, res: Response) => {
  try {
    const {
      stepId,
      answerType,
      answers,
      contactDetails,
      timeLimit,
      delayInteraction,
      multipleSelection,
      randomize,
      skipDataCollection,
      showOptionCount,
      appointmentLink,
      schedulingTool,
      worksWith,
      nextStepId,
    } = req.body;

    const step = await Steps.findById(stepId);

    if (!step) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }

    // Store nextStepId in a variable
    const extractedNextStepId = nextStepId;

    // Delete all Answer documents with the same stepId and different answerType
    await Answer.deleteMany({
      stepId,
      answerType: { $ne: answerType }, // Ensure answerType is different
    });

    // Create a new Answer document
    const answersData = await Answer.create({
      stepId,
      answerType,
      answers,
      contactDetails,
      timeLimit,
      delayInteraction,
      multipleSelection,
      randomize,
      skipDataCollection,
      showOptionCount,
      appointmentLink,
      schedulingTool,
      worksWith,
      nextStepId: extractedNextStepId,
    });

    await Steps.findOneAndUpdate(
      { _id: stepId },
      {
        $push: {
          answers: {
            answerId: answersData._id,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: answersData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

export const updateAnswers = async (req: Request, res: Response) => {
  try {
    const {
      answerId,
      answerType,
      answers,
      contactDetails,
      timeLimit,
      delayInteraction,
      multipleSelection,
      randomize,
      skipDataCollection,
      showOptionCount,
      appointmentLink,
      schedulingTool,
      worksWith,
      nextStepId,
    } = req.body;

    if (!answerId) {
      return res
        .status(404)
        .json({ success: false, error: 'Answer not found' });
    }

    const updatedAnswers = await Answer.findOneAndUpdate(
      { _id: answerId },
      {
        $set: {
          answerType,
          answers,
          contactDetails,
          timeLimit,
          delayInteraction,
          multipleSelection,
          randomize,
          skipDataCollection,
          showOptionCount,
          appointmentLink,
          schedulingTool,
          worksWith,
          nextStepId,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedAnswers });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

export default {
  addAnswer,
  updateAnswers,
};
