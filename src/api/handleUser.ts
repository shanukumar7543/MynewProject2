/* eslint-disable no-underscore-dangle */
import type { Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import JWT from 'jsonwebtoken';

// import { deleteImageFromS3 } from '@/utils/s3Uploader';
import Invite from '../models/Invite';
import Organization from '../models/Organization';
import User from '../models/User';

const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -otp');
    if (users) {
      return res.status(200).json(users);
    }
    return res.status(404).json({ error: 'No users found' }); // return an error object
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' }); // return an error object
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.body.currentUserId;
    const user = await User.findById(userId)
      .populate('organization.organizationID')
      .select('-password -OTP');

    //   const users = await User.aggregate([
    //     { $match: { _id: userId } },
    //     {
    //       $lookup: {
    //         from: 'organizations',
    //         localField: 'organization.organizationID',
    //         foreignField: '_id',
    //         as: 'organizationDetails',
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: 'folders',
    //         localField: 'organizationDetails.folders',
    //         foreignField: '_id',
    //         as: 'folderDetails',
    //       },
    //     },
    //     {
    //       $unwind: '$organizationDetails',
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'organizationDetails.members._id',
    //         foreignField: '_id',
    //         as: 'memberDetails',
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         email: 1,
    //         organization: {
    //           $map: {
    //             input: '$organization',
    //             as: 'org',
    //             in: {
    //               organizationID: '$$org.organizationID',
    //               name: '$organizationDetails.name',
    //               folders: '$organizationDetails.folders',
    //               members: {
    //                 $map: {
    //                   input: '$organizationDetails.members',
    //                   as: 'member',
    //                   in: {
    //                     _id: '$$member._id',
    //                     email: {
    //                       $arrayElemAt: [
    //                         {
    //                           $filter: {
    //                             input: '$memberDetails',
    //                             cond: { $eq: ['$$this._id', '$$member._id'] },
    //                           },
    //                         },
    //                         0,
    //                       ],
    //                     },
    //                     role: '$$member.role',
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   ]);

    //   console.log(
    //     `======================== ${new Date().toLocaleTimeString()} =======================`
    //   );
    // const user = users[0];
    //   console.log(user);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Something went wrong' });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    let user;
    let decodedToken: JwtPayload | string | null = null;
    const bearertoken = req?.headers?.authorization?.split(' ')[1];
    const token = JSON.stringify(bearertoken).replace(/\\|"/g, '');
    if (token) {
      decodedToken = JWT.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );
    }

    const userId = req.params.id || req.body.id;
    const userName = req.body.username;
    let userEmail;
    if (typeof decodedToken === 'object' && decodedToken?.data) {
      userEmail = decodedToken?.data?.email;
    } else {
      userEmail = req.body.email;
    }

    if (userId) {
      user = await User.findById(req.query.id)
        .populate('organization.organizationID', 'name')
        .select('-password -OTP');
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail })
        .populate('organization.organizationID', 'name')
        .select('-password -OTP');
    } else if (userName) {
      user = await User.findOne({ username: userName })
        .populate('organization.organizationID', 'name')
        .select('-password -OTP');
    } else {
      return res.status(400).send({ error: 'Invalid request parameters' });
    }

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // check if the email in the decoded token matches the user's email
    if (
      typeof decodedToken === 'object' &&
      decodedToken?.data?.email &&
      decodedToken.data.email !== user.email
    ) {
      return res.status(403).send({ error: 'Unauthorized access' });
    }

    const invites = await Invite.find({
      email: user?.email,
      status: 'PENDING',
    })
      .populate('organization')
      .populate('sender');

    const newuser = {
      user,
      pendingInvites: invites,
    };

    return res.status(200).json(newuser);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.params.id || req.body?._id;
    const user = await User.findById(userId).populate(
      'organization.organizationID',
      'name'
    );
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.firstName = req.body?.firstName ?? user.firstName;
    user.lastName = req.body?.lastName ?? user.lastName;
    user.username = req.body?.username ?? user.username;
    user.email = req.body?.email ?? user.email;
    user.jobTitle = req.body?.jobTitle ?? user.jobTitle;
    user.phoneNumber = req.body?.phoneNumber ?? user.phoneNumber;
    user.Bio = req.body?.Bio ?? user.Bio;
    user.countryCode = req.body?.countryCode ?? user.countryCode;
    user.defaultOrganization =
      req.body?.defaultOrganization ?? user.defaultOrganization;

    if (
      req.body.profilePicture &&
      user?.profilePicture?.bucket &&
      user?.profilePicture?.fileName
    ) {
      // await deleteImageFromS3(
      //   user?.profilePicture?.bucket,
      //   user?.profilePicture?.fileName
      // );
    }
    user.profilePicture = req.body?.profilePicture ?? user.profilePicture;

    const existingUser = await User.findOne({ email: req.body?.email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).send({ error: 'Email already exists' });
    }

    const updatedUser = await user.save();

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Something went wrong' });
  }
};

const getUserOrganizations = async (req: Request, res: Response) => {
  const userId = req.body.id;
  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).send({ success: false, error: 'User not found' });
    }
    const orgIds = user.organization.map((org) => org.organizationID);

    const invites = await Invite.find({
      email: user.email,
      status: 'PENDING',
    }).lean();

    const mergedOrgIds = [
      ...orgIds,
      ...invites.map((invite) => invite.organization),
    ];

    const organizations = await Organization.find({
      _id: { $in: mergedOrgIds },
    }).lean();

    const userOrgs = await Promise.all(
      organizations.map(async (org) => {
        const userOrg = user.organization.find(
          (uOrg) => uOrg.organizationID.toString() === org._id.toString()
        );
        const inviteOrg = invites.find(
          (invite) =>
            invite.organization.toString() === org._id.toString() &&
            invite.status === 'PENDING'
        );
        const query = {
          'organization.organizationID': org._id,
        };

        const countQuery = await User.countDocuments(query);
        return {
          organizationId: org._id,
          name: org.name,
          logo: org.logo,
          ownedDomain: org.ownedDomain,
          organizationRole: userOrg?.organizationrole || 'MEMBER',
          inviteStatus: inviteOrg?.status,
          inviteId: inviteOrg?._id,
          totalMembers: countQuery,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: userOrgs,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a function to get the count of total users
async function getNoOfUser() {
  try {
    const userCount = await User.countDocuments();
    return userCount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Define a route to get the count of total users
const getUserCount = async (_req: any, res: any) => {
  try {
    const userCount = await getNoOfUser();
    res.json({ count: userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  getAllUsers,
  getUserById,
  getUser,
  updateUser,
  getUserCount,
  getUserOrganizations,
};
