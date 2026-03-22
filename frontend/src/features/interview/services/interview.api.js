import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

export const generateInterviewReport = async ({ resumeFile, selfDescription, jobDescription, onProgress }) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("selfDescription", selfDescription);
  formData.append("jobDescription", jobDescription);

  // Simulate progress updates
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      
      let message = 'Starting...';
      if (progress > 10) message = 'Processing resume...';
      if (progress > 30) message = 'Analyzing job requirements...';
      if (progress > 50) message = 'Generating interview questions...';
      if (progress > 70) message = 'Finalizing report...';
      
      if (onProgress) {
        onProgress({ progress: Math.floor(progress), message });
      }
    }
  }, 800);

  try {
    const response = await api.post("/api/interview", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    clearInterval(progressInterval);
    
    // Complete progress
    if (onProgress) {
      onProgress({ progress: 100, message: 'Report generated successfully!' });
    }

    return response.data;
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

export const getInterviewReportByID = async (interviewId) => {
  const response = await api.get(`/api/interview/report/${interviewId}`);
  return response.data;
}

export const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview");
  return response.data; 
 }

 export const generateResumePdf = async (interviewReportId) => {
  const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
    responseType: "blob" // Important for handling binary data
  });
  return response.data; 
 }