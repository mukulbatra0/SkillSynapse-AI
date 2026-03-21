import './Loading.scss'

const Loading = ({ message = 'Loading...', size = 'medium', fullScreen = false }) => {
  const renderContent = () => (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`loading-content ${size}`}>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <p className="loading-message">{message}</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )

  return renderContent()
}

export default Loading
