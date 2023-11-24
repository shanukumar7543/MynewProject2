/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';

import Organization from '@/models/Organization';
import type { IUser } from '@/models/User';

import Folder from '../models/newfolder';

// create default folder
export const createDefaultFolder = async (organizationID: string) => {
  try {
    const f: any = new Folder({
      name: 'Default',
      organizationID,
      default: true,
    });

    const folder = await f.save();
    await Organization.findByIdAndUpdate(organizationID, {
      defaultFolder: folder._id,
    });

    return folder;
  } catch (err) {
    console.error(err);
    return err;
  }
};

// Get all folders
export const getFolder = async (_req: Request, res: Response) => {
  let userRole;
  let userId;
  if (_req.user) {
    userRole = (_req.user as IUser).role;
    userId = _req.body.currentUserId;
    // console.log(userRole, "role");
    // console.log(userId,"userid")
  } else {
    return res.status(400).json({ message: 'Role Not Founded' });
  }

  if (!_req.query.organizationID)
    return res.status(400).json({ message: 'Organization ID is required' });

  try {
    // console.log(userRole,"role")
    if (userRole === 'MEMBER') {
      const folders = await Folder.find({
        organizationID: _req.query.organizationID,
        'useraccess.userid': userId,
        'useraccess.access': { $in: ['read', 'write'] },
        // useraccess: {
        //     userid: userId,
        //     access: { $in: ["read", "write"] }, // Include any valid access type
        // },
      });
      return res.status(200).json(folders);
    }
    const folders = await Folder.find({
      organizationID: _req.query.organizationID,
    });
    return res.status(200).json(folders);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single folder by ID
export const getFolderById = async (req: Request, res: Response) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    return res.status(200).json(folder);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new folder
export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, organizationID } = req.body;
    // console.log(organizationID, "organizationID");
    const folder: any = new Folder({ name, organizationID });
    await folder.save();
    return res.status(201).json(folder);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update a folder by ID
const updateFolder = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const { name } = req.body;

    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { name },
      {
        new: true,
      }
    );

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    return res.status(200).json({ message: 'Folder updated successfully!' });
  } catch (error: any) {
    console.error('Error while updating folder:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a folder by ID
const delFolder = async (req: Request, res: Response) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    return res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// get default folder from organizationID
export const getDefaultFolder = async (req: Request, res: Response) => {
  try {
    const { organizationID } = req.query;
    if (!organizationID)
      return res.status(400).json({ message: 'Organization ID is required' });

    const folder = await Folder.findOne({
      organizationID,
      default: true,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    return res.status(200).json(folder);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  getFolder,
  getFolderById,
  createFolder,
  updateFolder,
  delFolder,
  getDefaultFolder,
};
