import sgMail from '@sendgrid/mail';
import JWt from 'jsonwebtoken';

import User from '@/models/User';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const getAccessToken = (
  email: string,
  role?: string,
  defaultOrganization?: object
) => {
  const data = { email, role, defaultOrganization };
  const accessToken = JWt.sign({ data }, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: '6h',
  });
  return accessToken;
};

export const getRefreshToken = (email: string, role?: string) => {
  const data = { email, role };
  const refreshToken = JWt.sign(
    { data },
    `${process.env.ACCESS_TOKEN_SECRET}`,
    {
      expiresIn: '1d',
    }
  );
  return refreshToken;
};

interface SendEmailProps {
  email: string | string[];
  subject: string;
  hashedToken: string;
  templateId: string;
  senderName?: string;
  organizationName?: string;
  otp?: string;
  editorName?: string;
  documentName?: string;
  docOwnerName?: string;
  userid?: string;
  dynamic_template_data?: {
    [key: string]: string;
  };
}
export const sendEmail = async (data: SendEmailProps) => {
  try {
    await User.findOneAndUpdate(
      { email: data.email },
      {
        verifyToken: data.hashedToken,
        verifyTokenExpiry: Date.now() + 360000,
      }
    );
    const msg = {
      to: data.email,
      from: `${process.env.SENDGRID_SENDER_MAIL}`,
      subject: data.subject,
      templateId: data.templateId,
      dynamic_template_data: data.dynamic_template_data ?? {
        VerifyEmailURL: `${process.env.FRONTEND_URL}/verifypage?token=${data.hashedToken}`,
      },
    };
    const sent = await sgMail.send(msg);

    return sent;
  } catch (err) {
    console.log(err, 'error');
  }
  return false;
};

interface ISendRawEmail {
  to: string | string[];
  subject: string;
  templateId: string;
  dynamic_template_data?: {
    [key: string]: string;
  };
}

export const sendRawEmail = async (data: ISendRawEmail) =>
  new Promise((resolve) => {
    try {
      const msg = {
        to: data.to,
        from: `${process.env.SENDGRID_SENDER_MAIL}`,
        subject: data.subject,
        templateId: data.templateId,
        dynamic_template_data: data.dynamic_template_data,
      };
      sgMail.send(msg, undefined, (err: any, _res: any) => {
        if (err) {
          console.log(err, 'error');
          resolve(false);
        } else {
          resolve(true);
        }
        return true as any;
      });
    } catch (err) {
      console.log(err, 'error');
      resolve(false);
    }
  });
