/* eslint-disable no-underscore-dangle */

import { type NextFunction, type Request, type Response } from 'express';
import mongoose from 'mongoose';

import { sendRawEmail } from '@/lib/helpers';
import Contact from '@/models/Contact';
import type { IInteraction } from '@/models/Interaction';
import Interaction from '@/models/Interaction';
// import { Router } from 'express';
import Organization from '@/models/Organization';
import VidyChat from '@/models/VidyChat';
// const adminRoute: Router = Router();

// a function with req, res as params
// also create and save contact in db if contact details are provided

const verifyInteraction = (interaction: IInteraction, vidyChat: any) => {
  if (!interaction.vidyChatId) return 'Invalid input. VidyChat ID is missing';

  if (interaction?.answers?.length! < vidyChat.stepsData.length - 2)
    return 'Invalid input. All steps are not answered';

  // verify answers based on step's answer's category & it's response type
  for (const { answer, stepId } of interaction.answers!) {
    const step = vidyChat.stepsData.find(
      (s: any) => s._id?.toString() === stepId!
    );
    // console.log(answer, stepId);
    // console.log(
    //   vidyChat.stepsData.filter(
    //     (s: any) => s.stepType !== 'INPUT' || s.stepType !== 'END'
    //   )
    // );

    if (!step) return 'Invalid input. Step not found';

    // check if answer.category matches with one of the step's answer's category
    if (answer.category !== step.answersData[0].answers.category)
      return 'Invalid input. Answer category does not match with step answer category';

    // if answer.category is MULTIPLE_CHOICE or BUTTON
    if (answer.category === 'MULTIPLE_CHOICE' || answer.category === 'BUTTON') {
      if (answer?.category !== 'BUTTON') {
        const mcqAnswers = step.answersData.flatMap((a: any) => a.answers.text);

        if (!mcqAnswers?.includes(answer?.selected as string))
          return 'Invalid input. The selected answer is not one of the step answer';
      }

      // check if answer.selected matches with one of the step's answer's selected
    } else if (answer.category === 'OPEN_ENDED') {
      const isValidResponseType = step.answersData.some(
        (_a: any) => _a.answers.responseType === answer.responseType
      );

      if (!isValidResponseType)
        return 'Invalid input. Answer response type does not match with step answer response type';

      if (answer.responseType === 'text' && !answer.text)
        return 'Invalid input. Answer text is missing';

      if (answer.responseType === 'video' || answer.responseType === 'audio') {
        if (!answer.S3Link || !answer.S3Link.url || !answer.S3Link.filename)
          return 'Invalid input. Answer S3Link is missing';
      }
    }
  }

  return null;
};

const submitInteraction = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const interaction = req.body as IInteraction;

    if (!interaction?.vidyChatId)
      return res.status(403).json({
        success: false,
        error: 'Invalid input. VidyChat ID is missing',
      });

    const vidyChat = await VidyChat.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(interaction.vidyChatId) },
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
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          userData: { $first: '$userData' },
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

    if (!vidyChat?.length)
      return res
        .status(403)
        .json({ success: false, error: 'Invalid input. Vidychat Not found' });

    const err = verifyInteraction(interaction, vidyChat[0]);

    if (err !== null)
      return res.status(403).json({ success: false, error: err });

    if (!interaction.contact) delete interaction.contact;

    console.log(interaction);

    const newInteraction = new Interaction(interaction);
    await newInteraction.save();

    if (interaction.contact) {
      await Contact.findOneAndUpdate(
        { email: interaction.contact.email, phone: interaction.contact.phone },
        {
          ...interaction.contact,
          name: interaction.contact?.name ?? 'Anonymous',
          organizationID: vidyChat[0].organizationId,
          vidyChatId: vidyChat[0]._id,
        },
        { upsert: true, new: true }
      );
    }

    const { email, name } = vidyChat[0].userData;
    console.log(vidyChat[0].userData);
    // const emailRes =
    await sendRawEmail({
      to: email,
      subject: 'New VidyChat interaction',
      templateId: 'd-3d992d290e3743f286b28caeca92e86e',
      dynamic_template_data: {
        owner: name,
        vidyChat: vidyChat[0].name,
        time: new Date().toLocaleString(),
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error?.message ?? 'Somethinh went wrong',
    });
  } finally {
    if (next) next();
  }
};

// a function to get all interactions of from an organization
const getAllInteractions = async (req: Request, res: Response) => {
  try {
    const { organizationID } = req.query as { organizationID: string };
    // const organizationID = '64edc09010c6b68024efde64';
    // console.log(organizationID);

    // get all interaction for the given organizationId
    const d: any = await Organization.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(organizationID),
        },
      },
      {
        $lookup: {
          from: 'vidychats',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'vidyChatData',
        },
      },
      {
        $lookup: {
          from: 'interactions',
          localField: 'vidyChatData._id',
          foreignField: 'vidyChatId',
          as: 'interactionsData',
        },
      },
      {
        // add vidychat name to each interaction, and add stepsData to each answer of each interaction
        $addFields: {
          interactionsData: {
            $map: {
              input: '$interactionsData',
              as: 'interaction',
              in: {
                $mergeObjects: [
                  '$$interaction',
                  {
                    vidyChatName: {
                      $arrayElemAt: [
                        '$vidyChatData.name',
                        {
                          $indexOfArray: [
                            '$vidyChatData._id',
                            '$$interaction.vidyChatId',
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // add stepsData to each answer of each interaction
      {
        $project: {
          vidyChatData: 0,
        },
      },
    ]);
    console.log(
      `============================ ${new Date().toLocaleTimeString()} ============================`
    );
    console.log(d[0]?.interactionsData[0]);
    if (!d.length)
      return res
        .status(403)
        .json({ success: false, error: 'Organization not found' });

    const interactions = d[0].interactionsData;

    return res.status(200).json({ success: true, data: interactions });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getInteraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // const { organizationID } = req.query as { organizationID: string };

    // const organizationID = '64edc09010c6b68024efde64';

    const interaction = await Interaction.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'vidychats',
          localField: 'vidyChatId',
          foreignField: '_id',
          as: 'vidyChatData',
        },
      },
      {
        $unwind: '$vidyChatData',
      },
      {
        $lookup: {
          from: 'steps',
          localField: 'answers.stepId',
          foreignField: '_id',
          as: 'stepsData',
        },
      },
      {
        $addFields: {
          vidyChatName: '$vidyChatData.name',
          answers: {
            $map: {
              input: '$answers',
              as: 'answer',
              in: {
                $mergeObjects: [
                  '$$answer',
                  {
                    stepData: {
                      $arrayElemAt: [
                        '$stepsData',
                        {
                          $indexOfArray: ['$stepsData._id', '$$answer.stepId'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          inputStep: {
            $arrayElemAt: [
              '$vidyChatData',
              {
                $indexOfArray: ['$vidyChatData.stepType', 'INPUT'],
              },
            ],
          },
        },
      },
      {
        $project: {
          vidyChatData: 0,
          stepsData: 0,
        },
      },
    ]);

    console.log(interaction);

    if (!interaction) {
      return res
        .status(404)
        .json({ success: false, error: 'Interaction not found' });
    }

    return res.status(200).json({ success: true, data: interaction[0] });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// a function to delete an interaction
const deleteInteraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    const interaction = await Interaction.findByIdAndDelete(
      new mongoose.Types.ObjectId(id as string)
    );

    if (!interaction)
      return res
        .status(403)
        .json({ success: false, error: 'Interaction not found' });

    return res.status(200).json({ success: true, data: interaction });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  deleteInteraction,
  getAllInteractions,
  getInteraction,
  submitInteraction,
};
