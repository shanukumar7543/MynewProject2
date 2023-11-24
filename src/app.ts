import 'express-async-errors';
import './api/passport';

import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { json } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import passport from 'passport';

import { verifyJWT } from './middlewares/authMiddleware';
import adminRoute from './routes/admin';
import buttonRoute from './routes/answer/button';
import answersRoute from './routes/answer/handleAnswers';
import multiChoiceRoute from './routes/answer/multichoice';
import openEndedRoute from './routes/answer/openEnded';
import authRoute from './routes/auth';
// import answersTypesRoute from './routes/handleAnswerTypes';
import contactRoute from './routes/handleContact';
import contactFormRoute from './routes/handleContactForm';
import folderRoute from './routes/handleFolder';
import inviteRoute from './routes/handleInvite';
import notificationRoute from './routes/handleNotifications';
import organizationRoute from './routes/handleOrganization';
import userRoute from './routes/handleUser';
import videoRoute from './routes/handlevideos';
import vidyChatRoute from './routes/handleVidyChat';
import stepsRoute from './routes/hanldeSteps';
import interactionRoute from './routes/interactions';
import passportRoute from './routes/passport';

dotenv.config();

const app = express();
app.use(json({ limit: '50mb' }));
app.use(helmet());
app.use(cors());
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);
app.use('/user', verifyJWT, userRoute);
app.use('/org', verifyJWT, organizationRoute);
app.use('/invite', inviteRoute);
app.use('/notification', verifyJWT, notificationRoute);
app.use('/', passportRoute);
app.use('/vedio', verifyJWT, videoRoute);
app.use('/vidychat', verifyJWT, vidyChatRoute);
app.use('/step', verifyJWT, stepsRoute);
app.use('/answers', verifyJWT, answersRoute);
app.use('/folder', verifyJWT, folderRoute);
app.use('/contactform', verifyJWT, contactFormRoute);
app.use('/contact', contactRoute);
app.use('/admin', adminRoute);
app.use('/interaction', interactionRoute);

app.use('/button', buttonRoute);
app.use('/multichoice', multiChoiceRoute);
app.use('/openended/', openEndedRoute);
// app.use('/answertypes', answersTypesRoute);

app.get('/get', (_req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/', (_, res) => {
  res.json({
    msg: 'Welcome to VidyChat!!',
  });
});

mongoose.set('strictQuery', false);
// console.log (process.env.MONGO_URI, 'env from github');

const mongoURI = process.env.MONGO_URI;
// process.env.NODE_ENV === 'production'
//   ?
// : 'mongodb://0.0.0.0:27017/vidychat';

mongoose.connect(mongoURI as string);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection failed'));
db.once('open', async () => {
  console.log('Database conencted successfully!');
});

export { app };
