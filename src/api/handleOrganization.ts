/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import type { IBrand } from '../models/Brand';
import Brand from '../models/Brand';
import Organization from '../models/Organization';
import type { UserModel } from '../models/User';
import User from '../models/User';

export const addOrganization = async (owner: string) => {
  try {
    // check if organization already exists
    // const organizationExists = await Organization.findOne({ name });
    // if (organizationExists) {
    //   return res
    //     .status(400)
    //     .json({ success: false, error: 'Organization already exists' });
    // }

    const organization = new Organization({
      name: 'My Organization',
      owner,
    });

    const savedOrganization = await organization.save();

    // add organization to user with admin role
    const user = await User.findById(owner);
    if (!user) return null;

    user.organization.push({
      organizationID: savedOrganization._id,
      organizationrole: 'ADMINSTRATOR',
    });

    // set default organization if the user doesn't have one
    // check if user has default organization, if not set the new organization as default
    if (!user.defaultOrganization.organizationID) {
      user.defaultOrganization = {
        organizationID: savedOrganization._id,
        organizationrole: 'ADMINSTRATOR',
      };
    }

    await user.save();

    return savedOrganization;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const addMemberToOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId, userId, organizationRole } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }

    // Check if user exists
    const user: UserModel | null = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is already a member of the organization
    const existingMembershipIndex: number = user.organization.findIndex(
      (membership) =>
        String(membership.organizationID) === String(organizationId)
    );
    if (existingMembershipIndex !== -1) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of the organization',
      });
    }

    // Add user as a member of the organization
    user.organization.push({
      organizationID: organizationId,
      organizationrole: organizationRole,
    });
    await user.save();

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getOrganizationMembers = async (req: Request, res: Response) => {
  try {
    const { organizationId, page = 1, search } = req.body;
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }

    const limit = 9;
    const skip = (Number(page) - 1) * limit;

    const query = {
      'organization.organizationID': organizationId,
      $or: [
        { username: { $regex: search || '', $options: 'i' } },
        { firstName: { $regex: search || '', $options: 'i' } },
        { lastName: { $regex: search || '', $options: 'i' } },
        { email: { $regex: search || '', $options: 'i' } },
        { 'organization.role': { $regex: search || '', $options: 'i' } },
      ],
    };

    const countQuery = User.countDocuments(query);
    const membersQuery = User.find(query)
      .select(
        'username email organization.organizationID organization.organizationrole firstName lastName profilePicture'
      )
      .skip(skip)
      .limit(limit)
      .exec();

    const [totalMembers, members] = await Promise.all([
      countQuery,
      membersQuery,
    ]);

    const transformedMembers = members.map((member) => {
      const mOrg = member.organization.find((org) => {
        return org.organizationID.toString() === organizationId.toString();
      });
      const organizationRole = mOrg?.organizationrole;

      return {
        memberId: member._id,
        username: member.username,
        firstName: member.firstName,
        lastName: member.lastName,
        pic: member.profilePicture,
        organizationRole,
      };
    });

    return res.status(200).json({
      success: true,
      data: { members: transformedMembers, totalMembers },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const editOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId, ...orgData } = req.body;
    // const userId = req.body.currentUserId;
    // const user = await User.findById(userId);
    const user = await (req as any).user;
    console.log(user);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find the organization by organizationId
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }

    // Check if the user has ADMINISTRATOR role for the organization
    const isAdmin = user.organization.some(
      (org: any) =>
        org.organizationID.toString() === organizationId &&
        org.organizationrole === 'ADMINSTRATOR'
    );

    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        error: 'User is not an administrator for this organization',
      });
    }

    // Update the organization data
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { ...orgData },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedOrganization });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }
    return res.status(200).json({ success: true, data: organization });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const removeMemberFromOrganization = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId, memberId } = req.query;
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: 'Organization not found' });
    }

    const admin = await User.findOne({
      _id: userId,
      organization: {
        $elemMatch: {
          organizationID: organizationId,
          organizationrole: 'ADMINSTRATOR',
        },
      },
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        error:
          'You are not authorized to remove members from this organization',
      });
    }

    const isMember = await User.findOne({
      _id: memberId,
      organization: {
        $elemMatch: {
          organizationID: organizationId,
        },
      },
    });

    if (!isMember) {
      return res
        .status(404)
        .json({ success: false, error: 'Member not found' });
    }
    const isMemberAdmin = await User.findOne({
      _id: memberId,
      organization: {
        $elemMatch: {
          organizationID: organizationId,
          organizationrole: 'ADMINSTRATOR',
        },
      },
    });

    if (isMemberAdmin) {
      return res.status(404).json({
        success: false,
        error:
          'Cannot remove the member. They may be the only admin in the organization.',
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: memberId,
        $or: [
          { 'organization.organizationID': organizationId },
          { 'defaultOrganization.organizationID': organizationId },
        ],
        'organization.organizationrole': { $ne: 'ADMINISTRATOR' },
        'defaultOrganization.organizationrole': { $ne: 'ADMINISTRATOR' },
      },
      {
        $pull: { organization: { organizationID: organizationId } },
        $unset: { defaultOrganization: { organizationID: organizationId } },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

async function getNoOfOrg() {
  try {
    const orgCount = await Organization.countDocuments();
    return orgCount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Define a route to get the count of total users
const getOrg = async (_req: any, res: any) => {
  try {
    const orgCount = await getNoOfOrg();
    res.json({ count: orgCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
// CRUD functions for Brand

// Create a new brand
const createBrand = async (req: Request, res: Response) => {
  try {
    const { organizationId, name, image, url } = req.body;
    console.log(req.body);

    const brand: IBrand = new Brand({
      organizationId,
      name,
      image,
      url,
    });
    await brand.save();
    res.status(200).json({ message: 'Brand created successfully', brand });
  } catch (error: any) {
    console.error(error);
    let msg = 'Server error';
    if (error.code === 11000) msg = 'Brand already exists';
    // if validation error
    if (error.name === 'ValidationError') msg = error.message;
    res.status(500).json({ message: msg });
  }
};

// Get all brands
const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const brands: IBrand[] = await Brand.find({ organizationId });
    res.status(200).json(brands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single brand by ID
// Get a single brand by ID and organization
const getBrandById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { organizationId } = req.query;
    const { id } = req.params;

    const brand: IBrand | null = await Brand.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId,
    });

    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.status(200).json(brand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update a brand by ID
const updateBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId, name, image, url } = req.body;
    const brand: IBrand | null = await Brand.findByIdAndUpdate(
      req.params.id,
      { organizationId, name, image, url },
      { new: true }
    );
    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.status(200).json({ message: 'Brand updated successfully', brand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a brand by ID and organization
const deleteBrandById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { organizationId } = req.query;
    if (!id || !organizationId)
      return res.status(400).json({ message: 'Invalid request' });

    const brand: IBrand | null = await Brand.findOne({
      _id: id,
      organizationId,
    });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    await Brand.findByIdAndDelete(id);
    res.status(200).json({ message: 'Brand deleted successfully', brand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrganizationsWithStats = async (_req: any, res: any) => {
  try {
    const organizations = await Organization.aggregate([
      {
        $lookup: {
          from: 'User',
          let: { orgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$$orgId', '$organization.organizationID'] },
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'VidyChat',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'videochats',
        },
      },
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'interactions',
        },
      },
      {
        $project: {
          name: 1,
          userCount: { $size: '$users' },
          videoChatCount: { $size: '$videochats' },
          interactionCount: { $size: '$interactions' },
        },
      },
    ]);

    console.log(organizations); // Log the result for debugging

    return res.status(200).json({ success: true, data: organizations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Define a new route to get all organizations with stats

export default {
  addMemberToOrganization,
  addOrganization,
  editOrganization,
  removeMemberFromOrganization,
  getOrganizationMembers,
  getOrganization,
  getOrg,
  createBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
  getAllOrganizationsWithStats,
};
