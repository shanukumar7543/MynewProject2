import type { Request, Response } from 'express';

import Answer from '@/models/Answers';
import Steps from '@/models/Steps';

export const addChoice = async (req: Request, res: Response) => {
  try {
    const { stepId, nextStepId, answerType, answer } = req.body;
    const { category, responseType, text } = answer;

    const existingStep = await Steps.findById(stepId);

    if (!existingStep) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Create a new Answer document
    const newAnswer = await Answer.create({
      stepId,
      answerType,
      answers: {
        category,
        responseType,
        text,
      },
      nextStepId,
    });

    return res.status(200).json(newAnswer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteChoice = async (req: Request, res: Response) => {
  try {
    const { stepId, answer } = req.body;
    const { responseType } = answer;
    const existingAnswer = await Answer.findOne({
      stepId,
      'answers.responseType': responseType,
    });

    if (!existingAnswer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Delete the found Answer document
    await existingAnswer.remove();

    return res.status(200).json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default {
  addChoice,
  deleteChoice,
};
