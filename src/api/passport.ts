import passport from 'passport';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
      // Handle user data returned by Google
      // Here, you can create or retrieve a user record from your database
      // and call the `done` function with the user object
      // For simplicity, we'll just pass the profile object
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done: (err: any, id?: any) => void) => {
  done(null, user);
});
passport.deserializeUser<any, any>((obj, done) => {
  done(null, obj);
});
