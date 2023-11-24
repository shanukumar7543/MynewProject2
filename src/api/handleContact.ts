/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';

import VidyChat from '@/models/VidyChat';

import Contact from '../models/Contact';

// Get all contact
export const getContact = async (_req: Request, res: Response) => {
  try {
    const { organizationID } = _req.query;
    if (!organizationID)
      return res.status(400).json({ message: 'Invalid organizationID' });

    const contact = await Contact.find({ organizationID }).sort({
      favorite: -1,
    });
    return res.status(200).json(contact);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single contact by ID
export const getContactById = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new contact
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, organizationID, phone } = req.body;
    if (!organizationID)
      return res.status(400).json({ message: 'Invalid organizationID' });

    const contact: any = new Contact({ name, email, organizationID, phone });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createContactByFunnel = async (req: Request, res: Response) => {
  try {
    const { stepId, contactData, vidyChatId, organizationID } = req.body;
    const vidyChat = await VidyChat.findById(vidyChatId);

    if (!vidyChat) {
      return res.status(400).json({ error: 'Vidychat not found' });
    }

    // const step = await User.findById(stepId);

    // if(!step){
    // return res.status(400).json({ error: 'Step not found' });
    // }

    const contactFormData = await Contact.create({
      vidyChatId,
      stepId,
      contactData,
      organizationID,
    });
    return res.status(200).json({ success: true, data: contactFormData });
  } catch (err) {
    console.log(err, 'err');
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a contact by ID
const updateContact = async (req: Request, res: Response) => {
  try {
    const contactId = req.params.id;
    const { name, phone, email, favorite } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { name, phone, email, favorite },
      {
        new: true,
      }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (err) {
    console.error('Error while updating contact:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a contact by ID
const delContact = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getContact,
  getContactById,
  createContact,
  updateContact,
  delContact,
  createContactByFunnel,
};
