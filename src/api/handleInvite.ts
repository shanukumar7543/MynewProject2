/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
import type { Request, Response } from 'express';

import { sendRawEmail } from '@/lib/helpers';

// import { sendEmail } from '../lib/helpers';
import Invite from '../models/Invite';
import Organization from '../models/Organization';
import User from '../models/User';
// import { url } from 'inspector';

const goToSignUp = async (req: Request, res: Response) => {
  try {
    const inviteId = req.query.id;

    const invites = await Invite.findById(inviteId);
    if (invites?.email) {
      const redirecturl = `${process.env.FRONTEND_URL}/signup/?email=${invites.email}&fromInvitation=true`;

      return res.redirect(redirecturl);

      // json({ success: true, data: { redirecturl  } });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getInvite = async (req: Request, res: Response) => {
  try {
    if (!req.query.organizationID) {
      return res.status(400).json({ message: 'Invalid organizationID' });
    }
    const invite = await Invite.find({
      organization: req.query.organizationID,
    }).populate('userId');
    return res.status(200).json(invite);
  } catch (err) {
    // console.log("error",err)
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInviteById = async (req: Request, res: Response) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    res.status(200).json(invite);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendInvites = async (req: Request, res: Response) => {
  const { email, organizationId, role, folder } = req.body;
  console.log(folder, 'folder');

  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const invite: any = new Invite({
      email,
      organization: organizationId,
      sender: req.body.currentUserId,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      role,
      folder,
      status: 'PENDING',
    });

    const respons = await invite.save();
    const id = respons._id;

    const emaildata = await sendRawEmail({
      to: email,
      subject: 'Invitation  Email ',
      templateId: 'd-fd14368a72d444d08594380c5061badb',
      dynamic_template_data: {
        inviteLink: `${process.env.BACKEND_URL}/invite/gotosignup?id=${id}`,
      },
    });
    console.log(emaildata, 'emaildata');
    goToSignUp(req, res);

    return res.status(200).json({ success: true, data: { invite } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// const updateInvite = async (req: Request, res: Response) => {
//   const { id, folder } = req.body;

//   try {
//     // Check if the invite exists
//     const invite = await Invite.findById(id);
//     // console.log("idddd",id)
//     if (!invite) {
//       console.log("idddd",id)
//       return res.send("invite not found").status(404);

//     }

//     // Update the invite status
//     invite.folder = folder;
//     const updatedInvite = await invite.find({
//       id:{id},
//     },
//     folder
//     );

//     return res
//       .status(200)
//       .send( updatedInvite );
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

const updateInvite = async (req: Request, res: Response) => {
  try {
    const { id, folder } = req.body;

    const invite = await Invite.findByIdAndUpdate(
      id,
      { folder }, // Use an object to specify the update
      {
        new: true,
      }
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    return res
      .status(200)
      .json({ message: 'Invite updated successfully!', invite });
  } catch (error: any) {
    console.error('Error while updating invite:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateInviteRole = async (req: Request, res: Response) => {
  try {
    const { id, role } = req.body;

    const invite = await Invite.findByIdAndUpdate(
      id,
      { role }, // Use an object to specify the update
      {
        new: true,
      }
    );

    await User.updateOne(
      { organization: invite?.organization },
      { role }, // Use an object to specify the update
      {
        new: true,
      }
    );
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    return res
      .status(200)
      .json({ message: 'Invite Role updated successfully!', invite });
  } catch (error: any) {
    console.error('Error while updating invite:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const acceptInvite = async (req: Request, res: Response) => {
  const { userId, inviteId, organizationId } = req.body;

  try {
    const invite = await Invite.findOne({
      _id: inviteId,
      organization: organizationId,
    });
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, error: 'Invite not found' });
    }

    if (invite.status === 'ACCEPTED') {
      return res
        .status(400)
        .json({ success: false, error: 'Invite already accepted' });
    }

    invite.status = 'ACCEPTED';
    invite.acceptedAt = new Date();
    await invite.save();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const existingOrganizationIndex = user.organization.findIndex(
      (org) => org.organizationID.toString() === organizationId
    );

    if (existingOrganizationIndex < 0) {
      user.organization.push({
        organizationID: organizationId,
        organizationrole: 'MEMBER',
      });
    }

    await user.save();

    return res
      .status(200)
      .json({ success: true, data: 'Invite accepted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteInvite = async (req: Request, res: Response) => {
  // const { inviteId } = req.body;

  try {
    const invite = await Invite.findByIdAndDelete(req.params.id);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    return res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  sendInvites,
  acceptInvite,
  updateInvite,
  updateInviteRole,
  goToSignUp,
  deleteInvite,
  getInvite,
  getInviteById,
};
