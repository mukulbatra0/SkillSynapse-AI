import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import {generateResumeReport , genrateResumePdf} from "../services/ai.service.js";
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
  try {
    console.log('=== Starting interview report generation ===');
    const resumeFile = req.file;
    
    if (!resumeFile) {
      console.log('ERROR: No resume file provided');
      return res.status(400).json({
        message: "Resume file is required"
      });
    }
    
    console.log('Resume file received:', {
      originalname: resumeFile.originalname,
      mimetype: resumeFile.mimetype,
      size: resumeFile.size
    });
    
    // Parse PDF using pdf-parse
    console.log('Parsing PDF...');
    
    // Create an instance of PDFParse class with buffer in data property
    const parser = new pdfParse.PDFParse({ data: resumeFile.buffer });
    
    // Try different methods to get text
    let resumeContent;
    try {
      // Try getText method
      resumeContent = await parser.getText();
    } catch (err) {
      console.log('getText failed, trying alternative methods...');
      // Try other possible methods
      if (typeof parser.parse === 'function') {
        resumeContent = await parser.parse();
      } else if (typeof parser.extract === 'function') {
        resumeContent = await parser.extract();
      } else {
        // List available methods
        console.log('Available parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
        throw new Error('Could not find appropriate parse method');
      }
    }
    
    console.log('PDF parsed successfully. Text length:', resumeContent.text?.length);
    
    const { selfDescription, jobDescription } = req.body;
    console.log('Request body:', {
      selfDescriptionLength: selfDescription?.length,
      jobDescriptionLength: jobDescription?.length
    });

    console.log('Calling AI service to generate report...');
    const interviewReportByAi = await generateResumeReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription
    });
    console.log('AI report generated successfully');
    console.log('AI response keys:', Object.keys(interviewReportByAi));
    
    // Sanitize the AI response to ensure proper structure
    console.log('Sanitizing AI response...');
    const sanitizedReport = {
      ...interviewReportByAi,
      technicalQuestions: sanitizeQuestions(interviewReportByAi.technicalQuestions),
      behavioralQuestions: sanitizeQuestions(interviewReportByAi.behavioralQuestions),
      skillGaps: sanitizeSkillGaps(interviewReportByAi.skillGaps),
      preparationPlan: sanitizePrepPlan(interviewReportByAi.preparationPlan),
      // Ensure title exists, fallback to a default if not provided by AI
      title: interviewReportByAi.title || 'Interview Preparation Report'
    };
    console.log('Report sanitized successfully');

    // Save the interview report to the database
    console.log('Saving to database...');
    const interviewReport = await InterviewReport.create({
      user: req.user.id,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      ...sanitizedReport
    });
    console.log('Report saved successfully with ID:', interviewReport._id);

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport
    });
  } catch (error) {
    console.error('=== ERROR in generateInterviewReportController ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
      errorType: error.name
    });
  }
}

/**
 * @description Retrieve an interview report by its ID for the authenticated user.
 * @route GET /api/interview/report/:interviewId
 * @access Private
 */

async function getInterviewReportByIDController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await InterviewReport.findOne({ _id: interviewId, user: req.user.id });

    if(!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    res.status(200).json({
      message: "Interview report retrieved successfully",
      interviewReport
    })
  } catch (error) {
    console.error('Error fetching interview report:', error);
    res.status(500).json({
      message: "Failed to fetch interview report",
      error: error.message
    });
  }
}

/**
 * @description Retrieve all interview reports for the authenticated user.
 * @route GET /api/interview/
 * @access Private
 */

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await InterviewReport.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"); // Exclude large text fields for listing

    res.status(200).json({
      message: "Interview reports retrieved successfully",
      interviewReports
    })
  } catch (error) {
    console.error('Error fetching interview reports:', error);
    res.status(500).json({
      message: "Failed to fetch interview reports",
      error: error.message
    });
  }
}
async function generateResumePdfController(req, res) {
  try {
    const {interviewReportId} = req.params;
    console.log(`Generating PDF for interview report: ${interviewReportId}`);
    
    const interviewReport = await InterviewReport.findOne({ _id: interviewReportId, user: req.user.id });

    if(!interviewReport) {
      console.log(`Interview report not found: ${interviewReportId}`);
      return res.status(404).json({ message: "Interview report not found" });
    }
    
    const { resume, selfDescription, jobDescription } = interviewReport;
    
    if (!resume || !selfDescription || !jobDescription) {
      console.log('Missing required fields in interview report');
      return res.status(400).json({ 
        message: "Interview report is incomplete. Missing required fields.",
        missing: {
          resume: !resume,
          selfDescription: !selfDescription,
          jobDescription: !jobDescription
        }
      });
    }
    
    console.log('Calling genrateResumePdf service...');
    const pdfBuffer = await genrateResumePdf({resume, selfDescription, jobDescription});

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=resume_${interviewReportId}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    console.log('PDF sent successfully');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in generateResumePdfController:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default{
  generateInterviewReportController,
  getInterviewReportByIDController,
  getAllInterviewReportsController,
  generateResumePdfController
}