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

  res.cookie("token", token)

  res.status(201).json({
    message: "User registered successfully"
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

  res.cookie("token", token)

  res.status(200).json({
    message: "User logged in successfully",
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })

}

async function logoutUserController(req, res){
  const token = req.cookies.token

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

  res.clearCookie("token")
  res.status(200).json({
    message: "User logged out successfully"
  })
}
export default {registerUserController, loginUserController , logoutUserController}