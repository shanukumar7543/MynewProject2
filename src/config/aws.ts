import AWS from 'aws-sdk';

// Configure the AWS SDK
const config = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
};

AWS.config.update(config);

export default AWS;
