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


export default authRouter