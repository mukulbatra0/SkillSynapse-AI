import {generateInterviewReport , getAllInterviewReports,getInterviewReportByID} from "../services/interview.api.js";
import { useContext } from "react";
import { InterviewContext } from "../interview.context";


export const useInterview = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }
    const { interviewReports, setInterviewReports, loading, setLoading, report, setReport } = context;

    const generateReport = async ({jobDescription ,  selfDescription , resumeFile}) => {
      setLoading(true);
      try {
        const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
        setReport(response.interviewReport);
        setInterviewReports(prev => [response.interviewReport, ...prev])
        return response.interviewReport;
      } catch (error) {
        console.error("Error generating interview report:", error);
        throw error;
      } finally {
        setLoading(false);
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

  return {
    interviewReports,
    loading,
    report,
    generateReport,
    getAllReports,
    getReportByID
  }
}