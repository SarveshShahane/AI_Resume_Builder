import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>AI-Powered Resume Builder</h1>
        <p>Create professional resumes with intelligent suggestions and optimization</p>
        
        <div className="features">
          <div className="feature">
            <h3>🤖 AI Assistance</h3>
            <p>Get intelligent suggestions to improve your resume content</p>
          </div>
          <div className="feature">
            <h3>📊 Job Optimization</h3>
            <p>Optimize your resume for specific job descriptions</p>
          </div>
          <div className="feature">
            <h3>✨ Professional Templates</h3>
            <p>Choose from modern, ATS-friendly resume templates</p>
          </div>
        </div>

        <div className="cta-buttons">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
