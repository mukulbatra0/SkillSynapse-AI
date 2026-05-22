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

  // List of models to try in order of preference
  const modelsToTry = [
    "qwen/qwen3.5-122b-a10b"
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`=== Trying model: ${model} ===`);
      console.log('Resume length:', resume?.length);
      console.log('Self description length:', selfDescription?.length);
      console.log('Job description length:', jobDescription?.length);
      
      const completion = await client.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 4000,
        // Removed response_format as it causes empty responses
      });

      console.log('AI response received successfully');
      
      // Check if response exists
      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        console.error('Invalid response structure:', JSON.stringify(completion));
        throw new Error('Invalid API response structure');
      }
      
      // The API returns data in either 'content' or 'reasoning_content' field
      const message = completion.choices[0].message;
      const responseText = message.content || message.reasoning_content;
      
      if (!responseText) {
        console.error('Empty response content');
        console.log('Full completion object:', JSON.stringify(completion, null, 2));
        continue; // Try next model
      }
      
      const trimmedResponse = responseText.trim();
      console.log('Response text length:', trimmedResponse.length);
      console.log('Response preview (first 500 chars):', trimmedResponse.substring(0, 500));
      
      // If response is too short, it's likely empty or invalid
      if (trimmedResponse.length < 50) {
        console.log('Response too short, trying next model...');
        continue;
      }
      
      // Remove markdown code blocks if present
      let cleanedText = trimmedResponse;
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      console.log('Parsing JSON response...');
      const parsedData = JSON.parse(cleanedText);
      console.log('Parsed data keys:', Object.keys(parsedData));
      
      // Validate that we have the required fields
      if (!parsedData.matchScore && !parsedData.technicalQuestions && !parsedData.behavioralQuestions) {
        console.log('Response missing required fields, trying next model...');
        continue;
      }
      
      console.log('Match score:', parsedData.matchScore);
      console.log('Technical questions count:', parsedData.technicalQuestions?.length);
      console.log('Behavioral questions count:', parsedData.behavioralQuestions?.length);
      
      return parsedData;
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      lastError = error;
      
      // If it's a 403/401, try next model
      if (error.status === 403 || error.status === 401 || error.message?.includes('403') || error.message?.includes('401')) {
        console.log(`Access denied for ${model}, trying next model...`);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }

  // If all models failed
  console.error("=== All models failed ===");
  throw new Error(`Failed to generate report. Please check your NVIDIA API key at https://build.nvidia.com/. Last error: ${lastError?.message}`);
}

async function generatePdf(htmlContent) {
  let browser;
  let page;
  try {
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ],
      timeout: 30000,
      protocolTimeout: 30000
    });
    console.log('Browser launched successfully');
    
    page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(30000);
    
    console.log('Setting HTML content...');
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000
    });
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    // Close page before closing browser
    await page.close();
    await browser.close();
    console.log('Browser closed successfully');
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error in generatePdf:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure cleanup
    try {
      if (page) await page.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    throw new Error(`PDF generation failed: ${error.message}`);
  }
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
    console.log('Calling OpenAI API for resume generation...');
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3.5-122b-a10b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000,
      // Remove response_format as it causes empty responses
    });

    // Check for content in both 'content' and 'reasoning_content' fields
    const message = completion.choices[0].message;
    const responseText = message.content || message.reasoning_content;
    
    if (!responseText) {
      console.error('Empty response from AI');
      throw new Error('AI returned empty response');
    }
    
    const trimmedResponse = responseText.trim();
    console.log('Received AI response, parsing JSON...');
    console.log('Response preview:', trimmedResponse.substring(0, 200));
    
    // Remove markdown code blocks if present
    let cleanedText = trimmedResponse;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    // Try to extract JSON if it's embedded in text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    const jsonContent = JSON.parse(cleanedText);
    console.log('JSON parsed. Keys:', Object.keys(jsonContent));
    
    if (!jsonContent.html) {
      console.error('AI response structure:', JSON.stringify(jsonContent, null, 2).substring(0, 500));
      throw new Error('AI response missing HTML content');
    }
    
    console.log('JSON parsed successfully, generating PDF...');
    const pdfBuffer = await generatePdf(jsonContent.html);
    console.log('Resume PDF generated successfully');
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    console.error("Error stack:", error.stack);
    
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    if (error.message?.includes('timeout')) {
      throw new Error("AI service timeout. Please try again.");
    }
    if (error.message?.includes('PDF generation failed')) {
      throw error; // Re-throw with original message
    }
    throw new Error(`Resume generation failed: ${error.message}`);
  }
}
export {generateResumeReport , genrateResumePdf};
