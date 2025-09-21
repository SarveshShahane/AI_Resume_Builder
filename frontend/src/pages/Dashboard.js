import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI } from '../services/api';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      setResumes(response.data);
    } catch (error) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeAPI.delete(id);
        setResumes(resumes.filter(resume => resume._id !== id));
      } catch (error) {
        setError('Failed to delete resume');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Resumes</h1>
        <Link to="/editor" className="btn-primary">
          Create New Resume
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="resumes-grid">
        {resumes.length === 0 ? (
          <div className="empty-state">
            <h3>No resumes yet</h3>
            <p>Create your first resume to get started</p>
            <Link to="/editor" className="btn-primary">
              Create Resume
            </Link>
          </div>
        ) : (
          resumes.map(resume => (
            <div key={resume._id} className="resume-card">
              <h3>{resume.personalInfo?.fullName || 'Untitled Resume'}</h3>
              <p>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
              <div className="resume-actions">
                <Link to={`/editor/${resume._id}`} className="btn-secondary">
                  Edit
                </Link>
                <button 
                  onClick={() => deleteResume(resume._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;