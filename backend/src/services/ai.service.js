import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

async function generateResumeReport({resume, selfDescription, jobDescription}) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  const prompt = `You are an expert interview preparation assistant. Generate an interview report for a candidate with the following details:

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

You MUST respond with a JSON object that follows this EXACT structure:
{
  "matchScore": <number between 0-100>,
  "technicalQuestions": [
    {
      "question": "<technical question string>",
      "intention": "<intention behind the question>",
      "answer": "<how to answer this question>"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "<behavioral question string>",
      "intention": "<intention behind the question>",
      "answer": "<how to answer this question>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "severity": "<low|medium|high>"
    }
  ],
  "preparationPlan": [
    {
      "day": <day number starting from 1>,
      "focus": "<main focus for this day>",
      "tasks": ["<task 1>", "<task 2>", ...]
    }
  ],
  "title": "<job title>"
}

IMPORTANT GUIDELINES FOR QUESTIONS:
- For TECHNICAL questions: 
  * "intention" should be specific and detailed (e.g., "Assess understanding of React hooks lifecycle and state management", "Evaluate knowledge of database indexing and query optimization")
  * "answer" should provide a comprehensive, structured response with key points, examples, and best practices the candidate should mention
  
- For BEHAVIORAL questions:
  * "intention" should explain what the interviewer is evaluating (e.g., "Assess problem-solving skills and ability to handle pressure", "Evaluate teamwork and conflict resolution abilities")
  * "answer" should guide the candidate on how to structure their response using frameworks like STAR (Situation, Task, Action, Result), what points to emphasize, and what to avoid

- Avoid generic responses like "Assess technical knowledge" or "Formulate answer based on experience"
- Make each intention and answer unique, specific, and actionable for the candidate

Generate 5-8 technical questions, 3-5 behavioral questions, identify 3-5 skill gaps, and create a 7-14 day preparation plan.`;

  // Convert zod schema to JSON schema and remove $schema field
  const jsonSchema = zodToJsonSchema(interviewReportSchema);
  delete jsonSchema.$schema;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
      temperature: 0.3, // Lower temperature for more consistent structure
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return JSON.parse(response.text());
}

async function generatePdf(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

async function genrateResumePdf({resume , selfDescription , jobDescription}) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume PDF generated by the AI based on the candidate's resume, self-description, and job description. This should be a complete HTML document that can be rendered to produce a well-formatted PDF resume by any library like Puppeteer.")
  });
  
  const prompt = `You are an expert resume builder. Generate a resume in HTML format for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

CRITICAL REQUIREMENTS:
1. ONE PAGE ONLY: The resume MUST fit on a single page when rendered as PDF. Use compact formatting and concise content.
2. BREVITY: Keep descriptions short and impactful. Use 2-3 bullet points per role, not more. Each bullet should be 1-2 lines maximum.
3. CONCISE LANGUAGE: Avoid verbose explanations. Use action verbs and quantifiable achievements.
4. COMPACT LAYOUT: Use minimal margins (0.5-0.75 inches), appropriate font size (10-11pt), and efficient spacing.

FORMATTING GUIDELINES:
- ATS-friendly: Use simple HTML structure with clear semantic sections (header, experience, education, skills)
- No tables, images, or complex CSS that might break ATS parsing
- Use standard section headings: Summary, Experience, Education, Skills, etc.
- Include metrics and numbers where possible (e.g., "Increased efficiency by 25%")
- Write naturally, avoiding AI-generated tone

CONTENT STRUCTURE:
- Header: Name, contact info (1-2 lines)
- Professional Summary: EXACTLY 2 lines maximum, no more. Be extremely concise and impactful.
- Experience: 2-3 most relevant roles, 2-3 bullets each
- Education: Degree, institution, year (1 line per degree)
- Skills: Comma-separated list, grouped by category if needed
- Keep everything concise and relevant to the job description

Return a JSON object with "html" field containing the complete HTML document optimized for single-page PDF generation.`;

  // Convert zod schema to JSON schema and remove $schema field
  const jsonSchema = zodToJsonSchema(resumePdfSchema);
  delete jsonSchema.$schema;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  
  const jsonContent = JSON.parse(response.text());
  const pdfBuffer = await generatePdf(jsonContent.html);
  return pdfBuffer;
}
export {generateResumeReport , genrateResumePdf};
