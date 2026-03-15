import { PDFParse } from "pdf-parse";
import generateResumeReport from "../services/ai.service.js";
import InterviewReport from "../models/interviewReport.model.js";



const sanitizeQuestions = (questions) => {
    if (!Array.isArray(questions)) return [];
    return questions.map(q => {
      if (typeof q === 'string') {
        return { question: q, intention: "Assess technical knowledge", answer: "Formulate answer based on experience." };
      }
      return {
        question: q.question || "Question not provided",
        intention: q.intention || "Intention not provided",
        answer: q.answer || "Answer not provided"
      };
    });
  };

  const sanitizeSkillGaps = (gaps) => {
    if (!Array.isArray(gaps)) return [];
    return gaps.map(g => {
      if (typeof g === 'string') {
        return { skill: g, severity: "medium" }; // Fallback object
      }
      // Force severity to lowercase to match your Mongoose enum!
      let safeSeverity = (g.severity || "medium").toLowerCase();
      if (!["low", "medium", "high"].includes(safeSeverity)) safeSeverity = "medium";
      
      return {
        skill: g.skill || "Skill not identified",
        severity: safeSeverity
      };
    });
  };

  const sanitizePrepPlan = (plan) => {
    if (!Array.isArray(plan)) return [];
    return plan.map((p, index) => {
      if (typeof p === 'string') {
        return { day: index + 1, focus: p, tasks: ["Review this topic"] };
      }
      return {
        day: typeof p.day === 'number' ? p.day : index + 1,
        focus: p.focus || "General Review",
        // Ensure tasks is always an array of strings
        tasks: Array.isArray(p.tasks) ? p.tasks : [p.tasks || "Review concepts"]
      };
    });
  };

  /**
 * @description Generate a comprehensive interview report based on the candidate's resume, self-description, and job description.
 * @access Private
 */
async function generateInterviewReportController(req, res) {


  const resumeFile = req.file;
   const parser = new PDFParse({ data: resumeFile.buffer });
  
  // Extract text
  const resumeContent = await parser.getText();
  
  // Clean up (optional but recommended)
  await parser.destroy();
  const { selfDescription, jobDescription } = req.body;


  const interviewReportByAi = await generateResumeReport({
    resume: resumeContent.text,//ec
    selfDescription,
    jobDescription
}) 
  
  // Sanitize the AI response to ensure proper structure
  const sanitizedReport = {
    ...interviewReportByAi,
    technicalQuestions: sanitizeQuestions(interviewReportByAi.technicalQuestions),
    behavioralQuestions: sanitizeQuestions(interviewReportByAi.behavioralQuestions),
    skillGaps: sanitizeSkillGaps(interviewReportByAi.skillGaps),
    preparationPlan: sanitizePrepPlan(interviewReportByAi.preparationPlan)
  };

  // Save the interview report to the database
  const interviewReport = await InterviewReport.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...sanitizedReport
  })

  res.status(201).json({
    message: "Interview report generated successfully",
    interviewReport
  })

}

/**
 * @description Retrieve an interview report by its ID for the authenticated user.
 * @route GET /api/interview/report/:interviewId
 * @access Private
 */

async function getInterviewReportByIDController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await InterviewReport.findOne({ _id: interviewId, user: req.user.id });

  if(!interviewReport) {
    return res.status(404).json({ message: "Interview report not found" });
  }

  res.status(200).json({
    message: "Interview report retrieved successfully",
    interviewReport
  })
}

/**
 * @description Retrieve all interview reports for the authenticated user.
 * @route GET /api/interview/
 * @access Private
 */

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await InterviewReport.find({ user: req.user.id }).createAt({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"); // Exclude large text fields for listing

  res.status(200).json({
    message: "Interview reports retrieved successfully",
    interviewReports
  })
}

export default{
  generateInterviewReportController,
  getInterviewReportByIDController,
  getAllInterviewReportsController
}