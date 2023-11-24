import type { Request, Response } from 'express';

import Answer from '@/models/Answers';
import Steps from '@/models/Steps';

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { stepId, answerType, answers } = req.body;
    const { category, responseType, text } = answers;

    const existingStep = await Steps.findById(stepId);

    if (!existingStep) {
      return res.status(404).json({ error: 'Step not found' });
    }

    console.log('Found the step');

    // Check if an Answer document with the same stepId and answerType exists
    let existingAnswer = await Answer.findOne({
      answerType,
      stepId,
    });
    if (existingAnswer) {
      // If an answer with the same stepId and answerType exists, update it
      existingAnswer.answers = {
        category,
        responseType,
        text,
      };
    } else {
      // If no existing answer with the same stepId and answerType, create a new one
      existingAnswer = new Answer({
        stepId,
        answerType,
        answers: {
          category,
          responseType,
          text,
        },
      });
    }

    await existingAnswer.save();

    return res.status(200).json(existingAnswer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default {
  createAnswer,
};
