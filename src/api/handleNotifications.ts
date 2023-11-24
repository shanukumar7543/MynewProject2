/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';

import Notifications from '../models/Notification';
import User from '../models/User';

export const createNotifications = async (
  emails: string[],
  content: string,
  documentId: string | undefined,
  documentName: string
) => {
  try {
    const getUserData = emails?.map(async (el) => {
      const getUser = await User.find({ email: el });
      const getUserId = await Promise.all(
        getUser.map(async (item) => {
          const notifications = await Notifications.create({
            userID: item._id,
            content,
            documentId,
            documentName,
          });
          return notifications;
        })
      );
      return getUserId;
    });

    await Promise.all(getUserData);
  } catch (error: any) {
    console.error(error);
  }
};

const getNotificationsFromUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const notifications = await Notifications.find({ userID: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: { notifications } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateNotification = async (req: Request, res: Response) => {
  try {
    const notificationsId = req.params.id;
    const updatedDocument = await Notifications.findByIdAndUpdate(
      { _id: notificationsId },
      {
        $set: {
          status: 'READ',
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: { updatedDocument } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  updateNotification,
  getNotificationsFromUserId,
};
