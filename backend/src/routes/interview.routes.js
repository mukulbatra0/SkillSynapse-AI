import express from "express";
import authMiddlewares from "../middlewares/auth.middlewares.js";
import interviewController from "../controller/interview.controller.js";
import upload from "../middlewares/file.middleware.js";


const interviewRouter = express.Router();

/**
 * @route POST api/interview/
 * @desc Generate a comprehensive interview report based on the candidate's resume, self-description, and job description.
 * @access Private
 */

interviewRouter.post("/", authMiddlewares.authUser,upload.single("resume"), interviewController.generateInterviewReportController);

/**
 * @route GET api/interview/report/:intrviewId
 * @desc Generate a comprehensive interview report based on the candidate's resume, self-description, and job description.
 * @access Private
 */

interviewRouter.get("/report/:interviewId", authMiddlewares.authUser, interviewController.getInterviewReportByIDController);


/**
 * @route GET api/interview/
 * @desc Generate a comprehensive interview report based on the candidate's resume, self-description, and job description.
 * @access Private
 */
interviewRouter.get("/", authMiddlewares.authUser, interviewController.getAllInterviewReportsController);

export default interviewRouter;