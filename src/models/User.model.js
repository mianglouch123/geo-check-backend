import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    brokerName : {
     type : String,
     required : [true , "Username is required"],
     trim : true
    },
    isVerified : {
     type : Boolean,
     default : false,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 8 characters long'],
    },

} , {
  timestamps : true
})

export const UserModel = mongoose.model("User" , UserSchema);