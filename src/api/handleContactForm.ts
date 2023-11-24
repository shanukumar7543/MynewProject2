import type { Request, Response } from 'express';
// import Notifications from '../models/Notification';
// import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

/* eslint-disable no-underscore-dangle */
import ContactForm from '@/models/ContactForm';
import VidyChat from '@/models/VidyChat';

const createContactForm = async (req: Request, res: Response) => {
  try {
    const { vidyChatId, stepId, contactData } = req.body;

    const vidyChat = await VidyChat.findById(vidyChatId);

    if (!vidyChat) {
      return res.status(400).json({ error: 'Vidychat not found' });
    }

    // const step = await User.findById(stepId);

    // if(!step){
    // return res.status(400).json({ error: 'Step not found' });
    // }

    const contactFormData = await ContactForm.create({
      vidyChatId,
      stepId,
      contactData,
    });
    return res.status(200).json({ success: true, data: contactFormData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

const updateContactForm = async (req: Request, res: Response) => {
  try {
    const contactId = req.params.id;

    const { contactData, consent, note, itemId, isRequired } = req.body;

    const contactField: any = await ContactForm.findById(contactId);

    if (!contactField) {
      return res.status(400).json({ error: 'Contact not found' });
    }

    if (itemId) {
      const objectIdItemId = new mongoose.Types.ObjectId(itemId);

      // Find the index of the item in the contactData array based on its _id
      const itemIndex = contactField.contactData.findIndex(
        (item: any) => item && item._id && item._id.equals(objectIdItemId)
      );

      if (itemIndex === -1) {
        return res.status(400).json({ error: 'Item not found' });
      }

      // Update the isRequired property of the specified contactData item
      contactField.contactData[itemIndex].isRequired = isRequired;

      // Save the updated contactField document
      await contactField.save();
      const contactFormData = await ContactForm.findByIdAndUpdate(
        { _id: contactId },
        {
          $set: { contactData: contactField.contactData },
        },
        { new: true }
      );

      return res.status(200).json({ success: true, data: contactFormData });
    }

    const contactFormData = await ContactForm.findByIdAndUpdate(
      { _id: contactId },
      {
        $push: { contactData }, // Update the contactData array
        $set: { consent, note },
      },

      { new: true }
    );

    return res.status(200).json({ success: true, data: contactFormData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

const removeContactFormData = async (req: Request, res: Response) => {
  try {
    const contactId = req.params.id;
    const { elementIdToRemove } = req.body;

    const contactField = await ContactForm.findById(contactId);

    if (!contactField) {
      return res.status(400).json({ error: 'Contact not found' });
    }

    const contactFormData = await ContactForm.findByIdAndUpdate(
      { _id: contactId },
      {
        $pull: {
          contactData: { _id: elementIdToRemove },
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: contactFormData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

const getContactFormById = async (req: Request, res: Response) => {
  try {
    const vidyChatId = req.params.id;

    const vidyChat = await VidyChat.findById(vidyChatId);

    if (!vidyChat) {
      return res.status(400).json({ error: 'Vidychat not found' });
    }

    // const step = await User.findById(stepId);

    // if(!step){
    // return res.status(400).json({ error: 'Step not found' });
    // }

    const contactFormData = await ContactForm.find({ vidyChatId });
    return res.status(200).json({ success: true, data: contactFormData });
  } catch (error: any) {
    console.error(error);
    return res.status(403).json({ success: false, error });
  }
};

export default {
  createContactForm,
  getContactFormById,
  updateContactForm,
  removeContactFormData,
};
