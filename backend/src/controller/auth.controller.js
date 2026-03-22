import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import blacklistTokenModel from "../models/blacklistToken.models.js"

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

  // Set cookie with proper options for cross-domain
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  })

  res.status(201).json({
    message: "User registered successfully",
    token, // Send token in response body
    user:{
      id: newUser._id,
      username: newUser.username,
      email: newUser.email
    }
  })

}

async function loginUserController(req, res){
  const {email, password} = req.body

  if(!email || !password){
    return res.status(400).json({
      message: "Please provide email and password"
    })
  }

  const user = await userModel.findOne({
    email
  })

  if(!user){
    return res.status(400).json({
      message: "Invalid email or password"
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if(!isPasswordValid){
    return res.status(400).json({
      message: "Invalid  password"
    })
  }

  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email
  }, process.env.JWT_SECRET, {expiresIn: "1d"}
  )

  // Set cookie with proper options for cross-domain
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  })

  res.status(200).json({
    message: "User logged in successfully",
    token, // Send token in response body
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })

}

async function logoutUserController(req, res){
  // Get token from Authorization header or cookie
  let token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    token = req.cookies.token;
  }

  if(!token){
    return res.status(400).json({
      message: "No token found"
    })
  }
  
  if(token){
    await blacklistTokenModel.create({
      token
    })
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  })
  res.status(200).json({
    message: "User logged out successfully"
  })
}

async function getMeController(req, res){

  const user = await userModel.findById(req.user.id)

  res.status(200).json({
    message: "User details fetched successfully",
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })

}
export default {registerUserController, loginUserController , logoutUserController , getMeController}