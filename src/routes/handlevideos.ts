import { Router } from 'express';

import {
  createPresignedUrlForThumbnailUpload,
  createPresignedUrlForUpload,
  generatePresignedUrlForViewing,
} from '@/utils/s3Uploader';

// import api from '../api/handleUser';

const videoRoute: Router = Router();

// userRoute.get('/getAll', api.getAllUsers);
// userRoute.put('/update/:id?', api.updateUser);
// userRoute.post('/get/:id?', api.getUser);
// userRoute.post('/getuserorgs', api.getUserOrganizations);
videoRoute.get('/get-image-upload-url', createPresignedUrlForUpload);
videoRoute.post('/get-video-download-url', generatePresignedUrlForViewing);
videoRoute.get('/get-thumbnail-url', createPresignedUrlForThumbnailUpload);

export default videoRoute;
