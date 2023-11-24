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

export const addChoice = async (req: Request, res: Response) => {
  try {
    const { stepId, nextStepId, answerType, answer } = req.body;
    const { category, responseType, text } = answer;

    const existingStep = await Steps.findById(stepId);

    if (!existingStep) {
      return res.status(404).json({ error: 'Step not found' });
    }
    console.log('ejdsvblk n');
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
    const { text } = req.body;

    // Find the Answer document to delete based on the provided text
    const existingAnswer = await Answer.findOne({ 'answers.text': text });

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

export const updateChoice = async (req: Request, res: Response) => {
  try {
    const { stepId, nextStepId, answer } = req.body;
    const { category, responseType, text } = answer;
    const existingStep = await Steps.findById(stepId);

    if (!existingStep) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Check if an Answer document with the same stepId and nextStepId exists
    let existingAnswer = await Answer.findOne({
      stepId,
      nextStepId,
    });

    if (existingAnswer) {
      // If an answer with the same stepId and nextStepId exists, update its text
      existingAnswer.answers.text = text;
    } else {
      // If no existing answer with the same stepId and nextStepId, create a new one
      existingAnswer = new Answer({
        stepId,
        answers: {
          category,
          responseType,
          text,
        },
        nextStepId,
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
  addChoice,
  deleteChoice,
  updateChoice,
};
