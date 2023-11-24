/* eslint-disable no-underscore-dangle */
import type { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

import User from '../models/User';

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader =
      (req.headers.authorization as string) ||
      (req.headers.Authorization as string);

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(
      token as string,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden', err });
        }

        const userData = decoded?.data?.email || decoded?.data?.phone;
        if (!userData) {
          return res.status(404).json({ message: 'User data not found' });
        }

        const user = await User.findOne({
          $or: [{ email: userData }, { phone: userData }],
        });
        if (!user) {
          return res.status(403).json({ message: 'User not found' });
        }

        req.body.currentUserId = user?._id;
        req.user = user;
        next();
        return false;
      }
    );
    return false;
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
