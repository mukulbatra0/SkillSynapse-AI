import userModel from "../models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"


async function registerUserController(req, res){
  const {username, email, password} = req.body;

  if(!username || !email || !password){
    return res.status(400).json({
      message: "Please provide username, email and password"
    })
  }

  const userExists = await userModel.findOne({
    $or:[{username}, {email}]
  })

  if(userExists){
    if(userExists.username === username){
      return res.status(400).json({
        message: "Username is already taken"
      })
    }

    return res.status(400).json({
      message: "Email is already taken"
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await userModel.create({
    username,
    email,
    password: hashedPassword
  })  

  const token = jwt.sign({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email
  }, process.env.JWT_SECRET, {expiresIn: "1d"}
  )

  res.cookie("token", token)

  res.status(201).json({
    message: "User registered successfully"
  })

}

export default {registerUserController}