import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { submitInteraction } from '@/api/handleInteractions';
import { getVidychatWithStepsAndAnswers } from '@/api/handleVidyChat';
import {
  createPresignedUrlForUpload,
  generatePresignedUrlForViewing,
} from '@/utils/s3Uploader';

const adminRoute: Router = Router();

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY)
    return res.status(404).end();

  next();
};

adminRoute.use(middleware);

// adminRoute.post('/query', async (req: Request, res: Response) => {
// try {
//   const { query } = req.body;
//   return res.status(200).json({ success: true, result });
// } catch (error: any) {
//   console.error(error);
//   return res.status(403).json({ success: false, error });
// }
// });

adminRoute.get('/vidychat/:id', getVidychatWithStepsAndAnswers);
adminRoute.get('/get-upload-url', createPresignedUrlForUpload);
adminRoute.get('/get-view-url', generatePresignedUrlForViewing);

adminRoute.post('/submit-interaction', submitInteraction);
// adminRoute.post('/delete-interaction', deleteInteraction);

export default adminRoute;
