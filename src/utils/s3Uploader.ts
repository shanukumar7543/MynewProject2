/* eslint-disable import/no-extraneous-dependencies */
import {
  // DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import axios from 'axios';
import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// intialize s3
const s3Client = new S3Client({
  region: process.env.AWS_REGION_1 || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_1 || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1 || '',
  },
});

const createPresignedUrlForUpload = async (req: Request, res: Response) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME || '';
    const expirationMinutes = 6;

    const fileType =
      req.query.type && ['audio', 'video'].includes(req.query.type as string)
        ? req.query.type
        : 'video';

    const isFromInteraction = Object.hasOwnProperty.call(
      req.query,
      'isFromInteraction'
    );

    const filename = `${
      isFromInteraction ? 'interactions/' : ''
    }${fileType}s/${uuidv4()}.${fileType === 'video' ? 'mp4' : 'mp3'}`;

    console.log('filename', filename);

    // Create the parameters for the PutObjectCommand
    const putParams = {
      Bucket: bucketName,
      Key: filename,
      ContentType: `${fileType}/web`,
    };

    // Create the PutObjectCommand
    const putCommand = new PutObjectCommand(putParams);

    // Generate the presigned URL with the specified expiration time
    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: expirationMinutes * 60,
    });

    console.log({
      url: signedUrl,
      filename,
      expiration: `${expirationMinutes} minutes`, // Convert minutes to milliseconds
    });

    // Return the presigned URL and other necessary data
    return res.status(200).json({
      url: signedUrl,
      filename,
      expiration: `${expirationMinutes} minutes`, // Convert minutes to milliseconds
    });
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to create presigned URL' });
  }
};

const createPresignedUrlForThumbnailUpload = async (
  _req: Request,
  res: Response
) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const expirationMinutes = 6;

    const filename = `thumbnail/${uuidv4()}.jpeg`;

    // Create the parameters for the PutObjectCommand
    const putParams = {
      Bucket: bucketName,
      Key: filename,
      ContentType: 'image/jpeg',
      // ContentEncoding: 'base64',
    };

    // Create the PutObjectCommand
    const putCommand = new PutObjectCommand(putParams);

    // Generate the presigned URL with the specified expiration time
    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: expirationMinutes * 60,
    });

    // Return the presigned URL and other necessary data
    return res.status(200).json({
      url: signedUrl,
      filename,
      expiration: `${expirationMinutes} minutes`, // Convert minutes to milliseconds
      bucket: bucketName,
      region: process.env.AWS_REGION_1,
    });
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to create presigned URL' });
  }
};

// main functions are above
// const generatePresignedUrlForUpload = async (
//   key: string,
//   contentType: string
// ) => {
//   try {
//     const bucketParams = {
//       Bucket: process.env.AWS_BUCKET_NAME || '',
//       Key: key,
//       ContentType: contentType,
//     };
//     const command = new PutObjectCommand(bucketParams);

//     const signedUrl = await getSignedUrl(s3Client, command, {
//       expiresIn: 60 * 60 * 4,
//     });
//     return signedUrl;
//   } catch (err) {
//     console.log('Error generating presigned URL for upload:', err);
//     throw err;
//   }
// };

// const uploadS3Document = async (presignedUrl: string, file: any) => {
//   try {
//     const response = await axios.put(presignedUrl, file);
//     if (response.status !== 200) {
//       throw new Error('Failed to upload document');
//     }
//     return response;
//   } catch (err) {
//     console.log('Error uploading document:', err);
//     throw err;
//   }
// };

const generatePresignedUrlForViewing = async (req: Request, res: Response) => {
  try {
    const bucketParams = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: req.body.Key ?? req.query.Key,
    };
    const expiresIn = 3600;
    const command = new GetObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });
    return res.status(200).json({
      url: signedUrl,
    });
  } catch (err) {
    console.log('Error generating presigned URL for viewing:', err);
    throw err;
  }
};

// const deleteDocument = async (key: string) => {
//   try {
//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME || '',
//       Key: key,
//     };
//     await s3Client.send(new DeleteObjectCommand(params));
//     console.log('File deleted successfully');
//   } catch (err) {
//     console.log('Error deleting document:', err);
//     throw err;
//   }
// };

// export const deleteImageFromS3 = async (bucket: string, fileName: string) => {
//   const params = {
//     Bucket: bucket,
//     Key: fileName,
//   };

//   try {
//     const command = new DeleteObjectCommand(params);
//     await s3Client.send(command);
//     console.log('Image deleted successfully');
//   } catch (error) {
//     console.error('Error deleting image:', error);
//   }
// };

export {
  createPresignedUrlForThumbnailUpload,
  // createPresignedUrlForImageUpload,
  createPresignedUrlForUpload,
  // deleteDocument,
  // generatePresignedUrlForUpload,
  generatePresignedUrlForViewing,
  s3Client,
  // uploadS3Document,
};
