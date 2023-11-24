import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface Iorganization {
  organizationID: Schema.Types.ObjectId;
  organizationrole?: string;
}
export interface IOneTimePassword {
  value: string | null;
  expiresIn: Date | null;
}

export interface ProfilePicture {
  fileName: string | undefined;
  url: string | undefined;
  bucket: string | undefined;
}

export interface IUser {
  role: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  phoneNumber?: number;
  countryCode?: string;
  OneTimePassword: IOneTimePassword;
  jobTitle?: string;
  Bio?: string;
  organization: Iorganization[];
  defaultOrganization: Iorganization;
  profilePicture: ProfilePicture;
  verifyToken: String;
  verifyTokenExpiry: Date;
  isSuperAdmin: boolean;
}

export interface UserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    role: {
      type: String,
      enum: ['ADMINSTRATOR', 'USER', 'MEMBER', 'ADMIN'],
      default: 'USER',
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    profilePicture: {
      fileName: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
      bucket: {
        type: String,
        required: false,
      },
    },
    phoneNumber: {
      type: Number,
      default: null,
      required: false,
    },
    countryCode: {
      type: String,
      default: null,
      required: false,
    },
    jobTitle: {
      type: String,
      default: null,
      required: false,
    },
    Bio: {
      type: String,
      default: null,
      required: false,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    verifyToken: { type: String, required: false, default: null },
    verifyTokenExpiry: { type: Date, required: false, default: null },
    OneTimePassword: {
      value: {
        type: String,
        default: null,
        required: false,
      },
      expiresIn: {
        type: Date,
        required: false,
      },
    },
    defaultOrganization: {
      organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'organization',
        required: false,
      },
      organizationrole: {
        type: String,
        enum: ['ADMINSTRATOR', 'MEMBER', 'ADMIN'],
        required: false,
      },
    },
    organization: [
      {
        organizationID: {
          type: Schema.Types.ObjectId,
          ref: 'organization',
          required: false,
        },
        organizationrole: {
          type: String,
          enum: ['ADMINSTRATOR', 'MEMBER', 'ADMIN'],
          default: 'MEMBER',
          required: false,
        },
      },
    ],
  },

  {
    versionKey: false,
    timestamps: true,
  }
);

const User = mongoose.model<UserModel>('user', UserSchema);
export default User;
