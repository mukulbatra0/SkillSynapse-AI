import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import './Home.scss'
import { useInterview } from '../hooks/useInterview'

const Home = () => {
  const { generateReport, loading } = useInterview()

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    jobDescription: '',
    selfDescription: '',
    resume: null
  })
  const [resumeFileName, setResumeFileName] = useState('')
  const [errors, setErrors] = useState({})

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

  return (
    <main className='home'>
      <div className="home-container">
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
    </main>
  )
}

export default Home
