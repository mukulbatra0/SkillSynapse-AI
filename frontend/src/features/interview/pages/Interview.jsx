import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import './Interview.scss'

const Interview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [interviewData, setInterviewData] = useState(null)
  const [activeSection, setActiveSection] = useState('technical')
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch interview data from API
    // Simulating API call with mock data
    const mockData = {
      _id: "69b6450abc981d9d75a95222",
      matchScore: 92,
      title: "Full Stack Developer (MERN Stack)",
      technicalQuestions: [
        {
          question: "You've used Redux Toolkit in your Media Search & Collection App. Can you explain the benefits of using Redux Toolkit over plain Redux, and how it simplifies state management in a large React application?",
          intention: "Assess technical knowledge",
          answer: ""
        },
        {
          question: "In your PortMySim project, you built a RESTful backend with Node.js and Express.js. Describe how you handled routing and middleware in Express.js, and provide an example of a custom middleware you might implement.",
          intention: "Assess technical knowledge",
          answer: ""
        },
        {
          question: "The job description mentions working with MongoDB databases. How would you design the schema for a 'user' and 'post' collection in a social media application, considering relationships and common query patterns?",
          intention: "Assess technical knowledge",
          answer: ""
        }
      ],
      behavioralQuestions: [
        {
          question: "Tell me about a time you had to collaborate with a product or design team on a project. How did you ensure effective communication and translate their requirements into technical solutions?",
          intention: "Assess soft skills",
          answer: ""
        },
        {
          question: "In your PortMySim project, you aimed to minimize service downtime by 90%. Describe a significant technical challenge you encountered during its development and how you approached solving it.",
          intention: "Assess problem-solving",
          answer: ""
        }
      ],
      skillGaps: [
        { skill: "Authentication/Authorization", severity: "medium" },
        { skill: "Testing (Unit/Integration)", severity: "medium" },
        { skill: "Deployment & DevOps Practices", severity: "medium" }
      ],
      preparationPlan: [
        { day: 1, focus: "Redux Toolkit Deep Dive", tasks: ["Review Redux Toolkit documentation", "Build sample app"] },
        { day: 2, focus: "Express.js Middleware", tasks: ["Study middleware patterns", "Implement custom middleware"] },
        { day: 3, focus: "MongoDB Schema Design", tasks: ["Review schema best practices", "Design sample schemas"] }
      ]
    }
    
    setTimeout(() => {
      setInterviewData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [id])

  const getCurrentQuestions = () => {
    if (!interviewData) return []
    return activeSection === 'technical' 
      ? interviewData.technicalQuestions 
      : activeSection === 'behavioral'
      ? interviewData.behavioralQuestions
      : []
  }

  const handleAnswerSubmit = () => {
    // TODO: Submit answer to API
    console.log('Answer submitted:', answer)
    setAnswer('')
  }

  if (isLoading) {
    return (
      <div className="interview-loading">
        <div className="spinner-large"></div>
        <p>Loading interview data...</p>
      </div>
    )
  }

  const currentQuestions = getCurrentQuestions()

  return (
    <main className="interview">
      <div className="interview-container">
        {/* Left Sidebar - Navigation */}
        <aside className="interview-sidebar">
          <div className="sidebar-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="match-score">
              <span className="score-label">Match Score</span>
              <span className="score-value">{interviewData?.matchScore}%</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'technical' ? 'active' : ''}`}
              onClick={() => { setActiveSection('technical'); setSelectedQuestion(0); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Technical Questions
              <span className="count">{interviewData?.technicalQuestions.length}</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'behavioral' ? 'active' : ''}`}
              onClick={() => { setActiveSection('behavioral'); setSelectedQuestion(0); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Behavioral Questions
              <span className="count">{interviewData?.behavioralQuestions.length}</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveSection('roadmap')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Preparation Roadmap
              <span className="count">{interviewData?.preparationPlan.length}</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="interview-content">
          {activeSection === 'technical' || activeSection === 'behavioral' ? (
            <>
              <div className="content-header">
                <h1>{activeSection === 'technical' ? 'Technical' : 'Behavioral'} Questions</h1>
                <p className="subtitle">{interviewData?.title}</p>
              </div>

              <div className="questions-list">
                {currentQuestions.map((q, index) => (
                  <div 
                    key={index}
                    className={`question-card ${selectedQuestion === index ? 'active' : ''}`}
                    onClick={() => setSelectedQuestion(index)}
                  >
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-content">
                      <p className="question-text">{q.question}</p>
                      <span className="question-tag">{q.intention}</span>
                    </div>
                  </div>
                ))}
              </div>

              {currentQuestions[selectedQuestion] && (
                <div className="answer-section">
                  <h3>Your Answer</h3>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                  />
                  <div className="answer-actions">
                    <button className="btn-secondary" onClick={() => setAnswer('')}>
                      Clear
                    </button>
                    <button className="btn-primary" onClick={handleAnswerSubmit}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="content-header">
                <h1>Preparation Roadmap</h1>
                <p className="subtitle">{interviewData?.preparationPlan.length} days plan</p>
              </div>

              <div className="roadmap-grid">
                {interviewData?.preparationPlan.slice(0, 21).map((day) => (
                  <div key={day.day} className="roadmap-card">
                    <div className="day-number">Day {day.day}</div>
                    <h4>{day.focus}</h4>
                    <ul>
                      {day.tasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Right Sidebar - Skill Gaps */}
        <aside className="interview-sidebar-right">
          <div className="skill-gaps-section">
            <h3>Skill Gaps</h3>
            <div className="skill-gaps-list">
              {interviewData?.skillGaps.map((gap, index) => (
                <div key={index} className={`skill-gap-item severity-${gap.severity}`}>
                  <span className="skill-name">{gap.skill}</span>
                  <span className="severity-badge">{gap.severity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tips-section">
            <h3>Interview Tips</h3>
            <div className="tip-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p>Use the STAR method for behavioral questions</p>
            </div>
            <div className="tip-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Take your time to think before answering</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Interview
