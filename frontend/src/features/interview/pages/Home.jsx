import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import './Home.scss'
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../auth/hooks/useAuth'

const Home = () => {
  const { handleLogout } = useAuth()
  const { generateReport, loading, getAllReports, interviewReports } = useInterview()

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    jobDescription: '',
    selfDescription: '',
    resume: null
  })
  const [resumeFileName, setResumeFileName] = useState('')
  const [errors, setErrors] = useState({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fetch all reports on component mount
  useEffect(() => {
    getAllReports()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, resume: 'Please upload a PDF file' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, resume: 'File size must be less than 5MB' }))
        return
      }
      setFormData(prev => ({ ...prev, resume: file }))
      setResumeFileName(file.name)
      setErrors(prev => ({ ...prev, resume: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required'
    }
    if (!formData.selfDescription.trim()) {
      newErrors.selfDescription = 'Self description is required'
    }
    if (!formData.resume) {
      newErrors.resume = 'Resume is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const reportData = await generateReport({
        jobDescription: formData.jobDescription,
        selfDescription: formData.selfDescription,
        resumeFile: formData.resume
      })
      
      // Navigate to interview page with the report ID
      if (reportData && reportData._id) {
        navigate(`/interview/${reportData._id}`)
      } else {
        // Fallback: navigate without ID, will use context
        navigate('/interview')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Failed to generate interview. Please try again.' })
    }
  }

  const handleResumeClick = () => {
    document.getElementById('resume').click()
  }

  const handleReportClick = (reportId) => {
    navigate(`/interview/${reportId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className='home'>
      <div className="home-container">
        <nav className="home-navbar">
          <div className="nav-left">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="nav-brand-logo">SkillSynapse<span>AI</span></div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>

        <div className="home-content-wrapper">
          {/* Sidebar */}
          <aside className={`home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="reports-section-container">
              {interviewReports && interviewReports.length > 0 ? (
          <section className="reports-section">
            <div className="reports-header">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2>Your Interview Reports</h2>
              <span className="report-count">{interviewReports.length}</span>
            </div>
            <div className="reports-grid">
              {interviewReports.map((report) => (
                <div 
                  key={report._id} 
                  className="report-card"
                  onClick={() => handleReportClick(report._id)}
                >
                  <div className="report-card-header">
                    <div className="report-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="report-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <div className="report-card-content">
                    <h3>Interview Report</h3>
                    <p className="report-description">
                      {report.jobDescription?.substring(0, 100)}
                      {report.jobDescription?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div className="report-card-footer">
                    <span className="view-report">
                      View Report
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </section>
              ) : (
                <div className="no-reports" style={{padding: '1.5rem', color: '#18392b', fontSize: '0.9rem'}}>No previous reports found.</div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="home-main">
            <header className="home-header">
              <h1>AI Interview Preparation</h1>
              <p>Prepare for your dream job with AI-powered interview practice</p>
            </header>

            <form className="home-form" onSubmit={handleSubmit}>
              <div className="form-grid">
            {/* Left Section - Job Description */}
            <div className="form-section">
              <div className="section-header">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2>Job Description</h2>
              </div>
              <div className="input-group">
                <textarea
                  placeholder="Paste the job description here..."
                  name='jobDescription'
                  id='jobDescription'
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className={errors.jobDescription ? 'error' : ''}
                />
                {errors.jobDescription && (
                  <span className="error-message">{errors.jobDescription}</span>
                )}
              </div>
            </div>

            {/* Right Section - Resume & Self Description */}
            <div className="form-section">
              {/* Resume Upload */}
              <div className="section-header">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h2>Resume</h2>
              </div>
              <div className="input-group">
                <input
                  hidden
                  type="file"
                  name="resume"
                  id="resume"
                  accept='.pdf'
                  onChange={handleFileChange}
                />
                <div 
                  className={`file-upload-area ${resumeFileName ? 'has-file' : ''} ${errors.resume ? 'error' : ''}`}
                  onClick={handleResumeClick}
                >
                  {resumeFileName ? (
                    <div className="file-info">
                      <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="file-name">{resumeFileName}</span>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload PDF</span>
                    </div>
                  )}
                </div>
                {errors.resume && (
                  <span className="error-message">{errors.resume}</span>
                )}
              </div>

              {/* Self Description */}
              <div className="section-header">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2>About You</h2>
              </div>
              <div className="input-group">
                <textarea
                  placeholder="Tell us about yourself..."
                  name='selfDescription'
                  id='selfDescription'
                  value={formData.selfDescription}
                  onChange={handleInputChange}
                  className={errors.selfDescription ? 'error' : ''}
                />
                {errors.selfDescription && (
                  <span className="error-message">{errors.selfDescription}</span>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="submit-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className='submit-btn'
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Interview
              </>
            )}
          </button>
        </form>
        </div>
      </div>
      </div>
    </main>
  )
}

export default Home
