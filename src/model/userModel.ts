// import mongoose, { Document, Schema } from 'mongoose';
// import { IUser } from '../domain/entities/IUser';

// export interface IUserDocument extends IUser, Document { }

// const userSchema: Schema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxlength: 20,
//   },
//   email: {
//     type: String,
//     required: true,
//     maxlength: 50,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//   },
//   location: {
//     type: String,
//   },
//   profilePicture: {
//     type: String,
//     default: '',
//   },
//   followers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   followings: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   likedPost: {
//     type: Array,
//     default: []
//   },
//   isAdmin: {
//     type: Boolean,
//     default: false,
//   },
//   bio: {
//     type: String,
//     maxlength: 50,
//   },
//   isBlocked: {
//     type: Boolean,
//     default: false
//   },
//   isPrivate: {
//     type: Boolean,
//     default: false
//   },
//   savedPosts: [
//     { type: String }
//   ],
//   created_at: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
// });

// export const User = mongoose.model<IUserDocument>('User', userSchema);



import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../domain/entities/IUser';

export interface IUserDocument extends IUser, Document { }

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  location: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedPost: {
    type: Array,
    default: []
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    maxlength: 50,
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  savedPosts: [
    { type: String }
  ],
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  // membership and payments
  isMember: {
    type: Boolean,
    default: false,
  },
  membership: {
    type: {
      type: String,
      default: 'lifetime'
    },
    amount:{
      type:Number,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
  },
  paymentStatus: {
    type: String, 
    default: 'pending',
  },
});

export const User = mongoose.model<IUserDocument>('User', userSchema);

