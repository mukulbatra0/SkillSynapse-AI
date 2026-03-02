import mongoose from "mongoose";  
const userSchema = new mongoose.Schema({
  username:{
    type: String,
    unique: [true, "user name already taken"],
    required: true

  },

  email:{
    type:String,
    unique:[true,"email is already taken"],
    required: true
  },

  password:{
    type:String,
    required:true,
    minlength:[6,"password must be at least 6 characters long"]
  }
})

const userModel = mongoose.model("user", userSchema)

export default userModel