import express from "express"
import authController from "../controller/auth.controller.js"
import authMiddlewares from "../middlewares/auth.middlewares.js"

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


/**
 * @route GET /api/auth/logout
 * @description logout  a user
 * @access private
 * 
 */
  authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the details of a logged-in user
 * @access private
 * 
 */

  authRouter.get("/get-me",authMiddlewares.authUser,authController.getMeController)

export default authRouter