import mongoose , { Schema } from "mongoose";

const TokenVerificationUserSchema = new Schema({
 token : {
   type : String,
   required : [true , "Se necesita codigo para verificar usuario"]
 },
  userId : {
   type : Schema.Types.ObjectId,
   ref : 'User',
   required : true,
   unique : true
  },
  expiresAt : {
   type : Date,
   default : () => new Date(Date.now() + 15 * 60 * 1000)
  } 

})

TokenVerificationUserSchema.index(
 { expiresAt : 1 } , { expireAfterSeconds : 0 }
)

export const TokenVerificationUserModel = mongoose.model("TokenVerificationUser" , TokenVerificationUserSchema);

