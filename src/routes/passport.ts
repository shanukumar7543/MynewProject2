import { Router } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import type { Profile } from 'passport-google-oauth20';

import { getAccessToken } from '../lib/helpers';
import User from '../models/User';

const passportRoute: Router = Router();

passportRoute.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
passportRoute.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Successful authentication, redirect to a success page or perform additional actions
      const { emails, displayName } = req.user as Profile;

      // Create an object with the desired user details
      if (emails?.length) {
        const user = await User.find({ email: emails[0]?.value });

        if (user?.length > 0) {
          const accessToken = await getAccessToken(emails[0]?.value as string);
          // const refreshToken = await getRefreshToken(
          //   emails[0]?.value as string

          // );
          res.cookie('accessToken', accessToken);
          return res.redirect(process.env.FRONTEND_URL as string);
        }
        // create db and generate access token
        const userData = await new User({
          _id: new mongoose.Types.ObjectId(),
          name: displayName,
          email: emails[0]?.value || '',
          password: '',
        });
        const userResult = await userData.save();
        const accessToken = await getAccessToken(userResult?.email);
        // const refreshToken = await getRefreshToken(
        //   userResult?.email,
        // );

        res.cookie('accessToken', accessToken);
        return res.redirect(process.env.FRONTEND_URL as string);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return false;
  }
);

export default passportRoute;
