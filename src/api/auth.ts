/* eslint-disable no-underscore-dangle */
import * as bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import Invite from '@/models/Invite';
import Folder from '@/models/newfolder';
import Organization from '@/models/Organization';

import { getAccessToken, getRefreshToken, sendRawEmail } from '../lib/helpers';
import User from '../models/User';
import { createDefaultFolder } from './handleNewFolder';
import { addOrganization } from './handleOrganization';
// import Folder from '@/models/newfolder';

interface TokenPayload {
  email: string;
}

const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  return jwt.sign(payload, 'swifty7097', { expiresIn });
};

const sendVerificationEmail = async (email: string) => {
  try {
    const hashedToken = await bcrypt.hash(email.toString(), 10);
    await User.findOneAndUpdate(
      { email },
      { $set: { verifyToken: hashedToken } }
    );

    await sendRawEmail({
      to: email,
      subject: 'Verification Email',
      templateId: 'd-d265e27bcc4a45a580fc35a31676cb59',
      dynamic_template_data: {
        VerifyEmailURL: `${process.env.FRONTEND_URL}/verifypage?token=${hashedToken}`,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const verifyToken = (token: string, email: string): boolean => {
  try {
    const decoded = jwt.verify(token, 'swifty7097') as TokenPayload;
    return decoded?.email === email;
  } catch (err) {
    return false;
  }
};

const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!password)
    return res.status(400).json({ error: 'All fields are required' });

  if (password.length < 8)
    return res
      .status(400)
      .json({ message: "Password can't be shorter than 8 characters" });

  const userExists = await User.find({
    $or: [{ email: { $regex: `${email}`, $options: 'i' } }],
  });

  if (userExists.length > 0)
    return res.status(400).json({ error: 'Email already exists' });

  try {
    if (email) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyEmail = await bcrypt.hash(email.toString(), 10);

      const InviteEmail = await Invite.findOne({ email });

      await Organization.findById(InviteEmail?.organization);

      let user;
      let userResult;

      if (InviteEmail && InviteEmail.status === 'PENDING') {
        const Org = {
          organizationID: InviteEmail?.organization,
          organizationrole: InviteEmail.role,
        };
        user = new User({
          _id: new mongoose.Types.ObjectId(),
          role: InviteEmail.role,
          name,
          organization: [Org],
          email,
          password: hashedPassword,
        });
        userResult = await user.save();

        await Invite.updateOne(
          { _id: InviteEmail._id },
          { $set: { status: 'ACTIVE', userId: user._id } },
          (error: any, result: any) => {
            if (error) {
              console.error('Error updating invite:', error);
            } else {
              console.log('Folder updated successfully:', result);
            }
          }
        ).clone();
        // todo refactor
      } else {
        user = new User({
          _id: new mongoose.Types.ObjectId(),
          role,
          name,
          email,
          password: hashedPassword,
        });
        userResult = await user.save();
        const defaultOrganization = (await addOrganization(
          userResult._id
        )) as any;

        await createDefaultFolder(defaultOrganization?._id);
      }

      const resEmail = await sendVerificationEmail(email);

      const newAccessObject = {
        userid: userResult._id,
      };

      if (InviteEmail?.role === 'MEMBER') {
        // todo refactor
        InviteEmail.folder.forEach((element: any) => {
          Folder.updateOne(
            {
              _id: new mongoose.Types.ObjectId(element.id),
            },
            {
              $push: {
                useraccess: { ...newAccessObject, access: element.access },
              },
            },
            (error: any, result: any) => {
              if (error) {
                console.error('Error updating folder:', error);
              } else {
                console.log('Folder updated successfully:', result);
              }
            }
          );
        });
      }

      if (!resEmail?.success) {
        return res.status(500).json({
          error: resEmail?.error ?? 'Failed to send verification email',
        });
      }

      const accessToken = await getAccessToken(
        userResult?.email,
        userResult?.role,
        userResult?.defaultOrganization
      );
      const refreshToken = await getRefreshToken(
        userResult?.email,
        userResult?.role
      );
      return res
        .status(200)
        .json({ accessToken, refreshToken, verifyEmail, email });
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ error: "User doesn't exit" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        error:
          'Email not verified. Please check your email for the verification link',
        emailVerified: false,
      });
    }

    const accessToken = await getAccessToken(
      user?.email,
      user?.role,
      user?.defaultOrganization
    );
    const refreshToken = await getRefreshToken(user?.email, user?.role);
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const SuperAdminlogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (user?.isSuperAdmin) {
      if (!user) {
        return res.status(404).json({ error: "User doesn't exit" });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ error: 'Invalid Credentials' });
      }

      if (!user.isEmailVerified) {
        return res.status(400).json({
          error:
            'Email not verified. Please check your email for the verification link',
          emailVerified: false,
        });
      }

      const accessToken = await getAccessToken(
        user?.email,
        user?.role,
        user?.defaultOrganization
      );
      const refreshToken = await getRefreshToken(user?.email, user?.role);

      return res.status(200).json({ accessToken, refreshToken, user });
    }
    return res.status(500).json({ error: 'Wrong Credentials' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // function to send OTP to user's email or phone number

    const expiration = new Date(Date.now() + 5 * 60 * 1000);
    const OTP = {
      value: otp,
      expiresIn: expiration,
    };
    user.OneTimePassword = OTP;
    await user.save();

    // await sendEmail({
    //   email: user?.email,
    //   // userid: user?.id,
    // });

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // const otpExpiration = user.OneTimePassword.expiresIn;

    // if (otpExpiration && otpExpiration < new Date()) {
    //   return res.status(400).json({ message: 'OTP has expired' });
    // }

    // console.log(user, otp);

    // if (user.OneTimePassword.value !== otp) {
    //   return res.status(400).json({ message: 'OTP is invalid' });
    // }

    // Generate a token that expires in 5 minutes
    const token = generateToken({ email }, '5m');

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }
    const OTP = {
      value: null,
      expiresIn: null,
    };
    user.OneTimePassword = OTP;
    await user.save();

    return res
      .status(200)
      .json({ data: { message: 'Email verified successfully', token } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ======================= { Verify Email } ======================= \\
const verifyemail = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const VerifyToken = token;
    const user = await User.findOne({
      verifyToken: VerifyToken,
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    user.isEmailVerified = true;
    user.verifyToken = '';
    await user.save();

    return res.status(200).json({ error: 'Token Verified' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// a function to send reset password email
const sendPasswordResetEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken({ email }, '10m');
    const result = await sendRawEmail({
      to: email,
      subject: 'Verification Email',
      templateId: 'd-5a3971b541e54bdea0356b9f57759398',
      dynamic_template_data: {
        reset_link: `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`,
      },
    });

    if (!result)
      return res.status(500).json({ message: 'Failed to send email.' });

    return res.status(200).json({
      message:
        'Password reset email sent successfully. The link is valid for 10 minutes only',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, token } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the token
    const isTokenValid = verifyToken(token, email);
    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.OneTimePassword.value = null;
    await user.save();

    // Code to send email or SMS to user that their password has been reset

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ======================= { Resend Email } ======================= \\
const resendEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Resend the verification email
    const verifyEmail = await bcrypt.hash(email.toString(), 10);

    user.verifyToken = verifyEmail;
    await user.save();

    const result = await sendRawEmail({
      to: user?.email,
      subject: 'Verification Email',
      templateId: 'd-d265e27bcc4a45a580fc35a31676cb59',
      dynamic_template_data: {
        VerifyEmailURL: `${process.env.FRONTEND_URL}/verifypage?token=${verifyEmail}`,
      },
    });

    if (!result)
      return res.status(500).json({ message: 'Failed to send email.' });

    return res
      .status(200)
      .json({ message: 'Verification email has been resent' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default {
  register,
  login,
  sendOtp,
  sendPasswordResetEmail,
  resetPassword,
  verifyOtp,
  verifyemail,
  resendEmail,
  SuperAdminlogin,
};
