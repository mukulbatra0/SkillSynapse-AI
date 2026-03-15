import { createContext , useState} from "react";


export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
    const [ interviewReports, setInterviewReports ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [report, setReport] = useState(null)

    return (
        <InterviewContext.Provider value={{ interviewReports, setInterviewReports, loading, setLoading, report, setReport }}>
            { children }
        </InterviewContext.Provider>
     )
}
