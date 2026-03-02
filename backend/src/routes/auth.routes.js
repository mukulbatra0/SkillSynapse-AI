import express from "express"
import authController from "../controller/auth.controller.js"


const authRouter = express.Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * 
 */
  authRouter.post("/register",authController.registerUserController)



  /**
 * @route POST /api/auth/login
 * @description login  a user
 * @access Public
 * 
 */

  authRouter.post("/login", authController.loginUserController)
export default authRouter