import {generateInterviewReport , getAllInterviewReports,getInterviewReportByID, generateResumePdf} from "../services/interview.api.js";
import { useContext, useState } from "react";
import { InterviewContext } from "../interview.context";


export const useInterview = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }
    const { interviewReports, setInterviewReports, loading, setLoading, report, setReport } = context;
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    const generateReport = async ({jobDescription ,  selfDescription , resumeFile}) => {
      setLoading(true);
      setProgress(0);
      setProgressMessage('Starting...');
      
      try {
        const response = await generateInterviewReport({ 
          jobDescription, 
          selfDescription, 
          resumeFile,
          onProgress: (progressData) => {
            setProgress(progressData.progress);
            setProgressMessage(progressData.message);
          }
        });
        
        setReport(response.interviewReport);
        setInterviewReports(prev => [response.interviewReport, ...prev])
        return response.interviewReport;
      } catch (error) {
        console.error("Error generating interview report:", error);
        setProgressMessage('Error generating report');
        throw error;
      } finally {
        setLoading(false);
        setProgress(0);
      }

    }

    const getAllReports = async () => {
      setLoading(true);
      try {
        const response = await getAllInterviewReports();
        setInterviewReports(response.interviewReports);
        return response.interviewReports;
      } catch (error) {
        console.error("Error fetching interview reports:", error);
      } finally {
        setLoading(false);
      }

  }

  const getReportByID = async (interviewId) => {
    setLoading(true);
    try {
      const response = await getInterviewReportByID(interviewId);
      setReport(response.interviewReport);
      return response.interviewReport; 
    } catch (error) {
      console.error("Error fetching interview report by ID:", error);
    } finally {
      setLoading(false);
    }
  }
    const getResumePdf = async (interviewReportId) => {
      setLoading(true);
      try {
        const pdfBlob = await generateResumePdf(interviewReportId);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating resume PDF:", error);
      } finally {
        setLoading(false);
      }
    };


  return {
    interviewReports,
    loading,
    report,
    progress,
    progressMessage,
    generateReport,
    getAllReports,
    getReportByID,
    getResumePdf
  }
}