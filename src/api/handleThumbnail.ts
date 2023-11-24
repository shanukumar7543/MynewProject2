import type { Request, Response } from 'express';

/* eslint-disable no-underscore-dangle */
import Steps from '@/models/Steps';
import User from '@/models/User';
// import Notifications from '../models/Notification';

const createThumbnail = async (req: Request, res: Response) => {
  try {
    const { stepId, thumbnail } = req.body;

    const step = await User.findById(stepId);

    if (!step) {
      return res.status(400).json({ error: 'Step not found' });
    }

    const updatedSteps = await Steps.findByIdAndUpdate(
      { _id: stepId },
      {
        $push: {
          thumbnail,
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

export default {
  createThumbnail,
};
