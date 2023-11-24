// /* eslint-disable no-underscore-dangle */
//  import type { Request, Response } from 'express';

// // import Notifications from '../models/Notification';
//  import VidyChat from '@/models/VidyChat';
//  import User from '@/models/User';
//  import Organization from '@/models/Organization';

//  export const createVedio = async (req: Request, res: Response) => {
//   try {
//    let {userId , organizationId , name , contactDetails , language ,overlaytext , originalFileName} = req.body

//    const user = await User.findById(userId);

//    if (!user) {
//      return res.status(404).json({ success: false, error: 'User not found' });
//    }

//    const organization = await Organization.findById(organizationId);

//    if (!organization) {
//      return res
//        .status(404)
//        .json({ success: false, error: 'Organization not found' });
//    }

//    const vedioData = await VidyChat.create({
//     userId,
//     organizationId,
//     name,
//     contactDetails,
//     language,
//     overlaytext,
//     S3Link: {
//       bucket: process.env.AWS_BUCKET_NAME,
//       originalName: originalFileName,
//       fileKey: originalFileName,
//     },
//   });

//   return res.status(200).json({ success: true, data: vedioData });

//   } catch (error: any) {
//     console.error(error);
//   }
// };

// export default {
//   createVedio,
// };
