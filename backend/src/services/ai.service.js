import OpenAI from "openai";
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
  const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
    timeout: 60000,
  });

  const prompt = `You are an expert interview preparation assistant. Generate an interview report for a candidate.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

JSON Structure:
{
  "matchScore": <number 0-100>,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string - specific detailed intention",
      "answer": "string - comprehensive structured response"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string - what interviewer evaluates",
      "answer": "string - how to structure response with STAR framework"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low|medium|high"
    }
  ],
  "preparationPlan": [
    {
      "day": <number>,
      "focus": "string",
      "tasks": ["string", "string"]
    }
  ],
  "title": "string"
}

Requirements:
- 5-7 technical questions with specific intentions and detailed answers
- 3-4 behavioral questions with evaluation criteria and STAR guidance
- 3-4 skill gaps with severity
- 7-10 day preparation plan
- Avoid generic responses
- Keep answers concise but actionable`;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3.5-122b-a10b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let cleanedText = responseText;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating interview report:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    throw error;
  }
}

async function generatePdf(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ 
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
  return pdfBuffer;
}

async function genrateResumePdf({resume , selfDescription , jobDescription}) {
  const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
    timeout: 60000,
  });
  
  const prompt = `You are an expert resume builder. Generate a resume in HTML format.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

CRITICAL: Return ONLY valid JSON with "html" field. No markdown, no code blocks.

Requirements:
- ONE PAGE ONLY with compact formatting
- Professional Summary: EXACTLY 2 lines maximum
- Experience: 2-3 roles, 2-3 bullets each (1-2 lines per bullet)
- Education: 1 line per degree
- Skills: Comma-separated list
- ATS-friendly: Simple HTML, no tables/images
- Include metrics where possible
- Natural tone, not AI-generated

Return format:
{
  "html": "<complete HTML document>"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3.5-122b-a10b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let cleanedText = responseText;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    const jsonContent = JSON.parse(cleanedText);
    const pdfBuffer = await generatePdf(jsonContent.html);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    throw error;
  }
}
export {generateResumeReport , genrateResumePdf};
