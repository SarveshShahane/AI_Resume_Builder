import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI, aiAPI } from '../services/api';
import ResumePreview from '../components/ResumePreview';
import '../components/ResumePreview.css';

const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: []
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobOptimization, setJobOptimization] = useState(null);
  const [resumeColors, setResumeColors] = useState({
    primary: '#2563eb',      
    secondary: '#475569',    
    accent: '#059669',       
    border: '#d1d5db',      
    text: '#111827'         
  });

  useEffect(() => {
    if (id) {
      loadResume();
    }
  }, [id]);

  const loadResume = async () => {
    try {
      const response = await resumeAPI.getById(id);
      setResume(response.data);
    } catch (error) {
      console.error('Failed to load resume:', error);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setResume({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    setResume({ ...resume, summary: value });
    
    if (aiSuggestions && aiSuggestions.summary && value === aiSuggestions.summary.improved) {
      const successIndicator = document.createElement('div');
      successIndicator.textContent = '✅ Summary enhanced successfully!';
      successIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        animation: slideIn 0.3s ease-out;
      `;
      
      if (!document.querySelector('#success-animation')) {
        const style = document.createElement('style');
        style.id = 'success-animation';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(successIndicator);
      
      setTimeout(() => {
        if (successIndicator.parentNode) {
          successIndicator.remove();
        }
      }, 3000);
    }
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: []
        }
      ]
    });
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...resume.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setResume({ ...resume, experience: newExperience });
  };

  const removeExperience = (index) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index)
    });
  };

  const addSkillCategory = () => {
    setResume({
      ...resume,
      skills: [
        ...resume.skills,
        { category: '', items: [] }
      ]
    });
  };

  const updateSkillCategory = (index, field, value) => {
    const newSkills = [...resume.skills];
    if (field === 'items') {
      newSkills[index].items = value.split(',').map(item => item.trim());
    } else {
      newSkills[index][field] = value;
    }
    setResume({ ...resume, skills: newSkills });
  };

  const removeSkillCategory = (index) => {
    setResume({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    setResume({
      ...resume,
      achievements: [
        ...resume.achievements,
        {
          description: '',
          aiSuggestion: null
        }
      ]
    });
  };

  const updateAchievement = (index, field, value) => {
    const newAchievements = [...resume.achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setResume({ ...resume, achievements: newAchievements });
  };

  const removeAchievement = (index) => {
    setResume({
      ...resume,
      achievements: resume.achievements.filter((_, i) => i !== index)
    });
  };

  const improveAchievement = async (index) => {
    if (!resume.achievements[index].description.trim()) {
      alert('Please enter an achievement first');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.improveAchievement(resume.achievements[index].description, resume);
      const newAchievements = [...resume.achievements];
      newAchievements[index].aiSuggestion = response.data.improved;
      setResume({ ...resume, achievements: newAchievements });
    } catch (error) {
      alert('Failed to improve achievement');
    } finally {
      setLoading(false);
    }
  };

  const applyAchievementImprovement = (index) => {
    const newAchievements = [...resume.achievements];
    newAchievements[index].description = newAchievements[index].aiSuggestion;
    newAchievements[index].aiSuggestion = null;
    setResume({ ...resume, achievements: newAchievements });
    
    const successMsg = document.createElement('div');
    successMsg.textContent = '✅ Achievement improved!';
    successMsg.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #10b981; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 1000; font-weight: 600;
    `;
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
  };

  const dismissAchievementSuggestion = (index) => {
    const newAchievements = [...resume.achievements];
    newAchievements[index].aiSuggestion = null;
    setResume({ ...resume, achievements: newAchievements });
  };

  const saveResume = async () => {
    setLoading(true);
    try {
      if (id) {
        await resumeAPI.update(id, resume);
      } else {
        const response = await resumeAPI.create(resume);
        navigate(`/editor/${response.data._id}`);
      }
      alert('Resume saved successfully!');
    } catch (error) {
      alert('Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.improveResume(resume);
      setAiSuggestions(response.data.suggestions);
    } catch (error) {
      alert('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (section) => {
    setLoading(true);
    try {
      const response = await aiAPI.generateContent(section, resume);
      const content = response.data.content;
      
      if (section === 'summary') {
        handleSummaryChange(content);
      }
    } catch (error) {
      alert('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const optimizeForJob = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description first');
      return;
    }
    
    setLoading(true);
    try {
      const response = await aiAPI.optimizeForJob(resume, jobDescription);
      setJobOptimization(response.data.optimization);
    } catch (error) {
      alert('Failed to optimize for job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-editor">
      <div className="editor-header">
        <h1>Resume Editor</h1>
        <div className="editor-actions">
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className="btn-secondary"
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview & Print'}
          </button>
          <button onClick={getAISuggestions} disabled={loading} className="btn-ai">
            🤖 Get AI Suggestions
          </button>
          <button onClick={saveResume} disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      </div>

      <div className="editor-content">
        {showPreview ? (
          <ResumePreview 
            resume={resume} 
            onColorChange={setResumeColors}
          />
        ) : (
          <>
            <div className="editor-sidebar">
          <div className="section-nav">
            <button 
              className={activeSection === 'personal' ? 'active' : ''}
              onClick={() => setActiveSection('personal')}
            >
              Personal Info
            </button>
            <button 
              className={activeSection === 'summary' ? 'active' : ''}
              onClick={() => setActiveSection('summary')}
            >
              Summary
            </button>
            <button 
              className={activeSection === 'experience' ? 'active' : ''}
              onClick={() => setActiveSection('experience')}
            >
              Experience
            </button>
            <button 
              className={activeSection === 'skills' ? 'active' : ''}
              onClick={() => setActiveSection('skills')}
            >
              Skills
            </button>
            <button 
              className={activeSection === 'achievements' ? 'active' : ''}
              onClick={() => setActiveSection('achievements')}
            >
              🏆 Achievements
            </button>
            <button 
              className={activeSection === 'job-match' ? 'active' : ''}
              onClick={() => setActiveSection('job-match')}
            >
              Job Matching
            </button>
          </div>
        </div>

        <div className="editor-main">
          {activeSection === 'personal' && (
            <div className="section">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={resume.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={resume.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={resume.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={resume.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="LinkedIn"
                  value={resume.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="GitHub"
                  value={resume.personalInfo.github}
                  onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeSection === 'summary' && (
            <div className="section">
              <div className="section-header">
                <h2>Professional Summary</h2>
                <button 
                  onClick={() => generateContent('summary')} 
                  className="btn-ai-small"
                  disabled={loading}
                >
                  ✨ Generate with AI
                </button>
              </div>
              <textarea
                placeholder="Write a compelling professional summary..."
                value={resume.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows="4"
              />
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="section">
              <div className="section-header">
                <h2>Work Experience</h2>
                <button onClick={addExperience} className="btn-secondary">
                  + Add Experience
                </button>
              </div>
              {resume.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    />
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                    <input
                      type="date"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      disabled={exp.current}
                    />
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                    />
                    Currently working here
                  </label>
                  <textarea
                    placeholder="Job description and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows="3"
                  />
                  <button 
                    onClick={() => removeExperience(index)} 
                    className="btn-danger-small"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="section">
              <div className="section-header">
                <h2>Skills</h2>
                <button onClick={addSkillCategory} className="btn-secondary">
                  + Add Skill Category
                </button>
              </div>
              {resume.skills.map((skillCategory, index) => (
                <div key={index} className="skill-category">
                  <input
                    type="text"
                    placeholder="Category (e.g., Programming Languages)"
                    value={skillCategory.category}
                    onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Skills (comma-separated)"
                    value={skillCategory.items.join(', ')}
                    onChange={(e) => updateSkillCategory(index, 'items', e.target.value)}
                  />
                  <button 
                    onClick={() => removeSkillCategory(index)} 
                    className="btn-danger-small"
                  >
                    Remove
                  </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'achievements' && (
          <div className="section">
            <h2>🏆 Achievements & Awards</h2>
            
            {resume.achievements.map((achievement, index) => (
              <div key={index} className="form-group simple-achievement">
                <div className="achievement-input-group">
                  <textarea
                    placeholder="• Enter your achievement here (e.g., Increased sales by 25% leading to $100K revenue boost)"
                    value={achievement.description}
                    onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                    rows="2"
                    className="simple-achievement-input"
                  />
                  <div className="achievement-actions">
                    <button 
                      onClick={() => improveAchievement(index)}
                      className="btn-ai-small"
                      disabled={loading || !achievement.description.trim()}
                      title="AI will improve your achievement"
                    >
                      {loading ? '✨' : '🤖'}
                    </button>
                    <button 
                      onClick={() => removeAchievement(index)} 
                      className="btn-danger-small"
                      title="Remove achievement"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {achievement.aiSuggestion && (
                  <div className="ai-improvement-suggestion">
                    <div className="improvement-header">
                      <span>🤖 AI Improved Version:</span>
                    </div>
                    <div className="improved-text">
                      {achievement.aiSuggestion}
                    </div>
                    <div className="suggestion-actions">
                      <button 
                        onClick={() => applyAchievementImprovement(index)}
                        className="btn-apply-small"
                      >
                        ✅ Apply
                      </button>
                      <button 
                        onClick={() => dismissAchievementSuggestion(index)}
                        className="btn-dismiss"
                      >
                        ✖️ Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button onClick={addAchievement} className="btn-secondary">
              ➕ Add Achievement
            </button>
          </div>
        )}

        {activeSection === 'job-match' && (
          <div className="section">
            <h2>Job Description Matching</h2>
            <div className="job-optimization-section">
              <textarea
                placeholder="Paste the job description here to get optimization suggestions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows="8"
                className="job-description-input"
              />
              <button 
                onClick={optimizeForJob} 
                className="btn-ai"
                disabled={loading || !jobDescription.trim()}
              >
                {loading ? 'Analyzing...' : '🎯 Optimize for This Job'}
              </button>
              
              {jobOptimization && (
                <div className="job-optimization-results">
                  <h3>Job Match Analysis</h3>
                  
                  <div className="match-score">
                    <h4>Match Score: {jobOptimization.matchScore}%</h4>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${jobOptimization.matchScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {jobOptimization.priorityActions && (
                    <div className="priority-actions">
                      <h4>🚀 Priority Actions:</h4>
                      <ol>
                        {jobOptimization.priorityActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {jobOptimization.missingKeywords && jobOptimization.missingKeywords.length > 0 && (
                    <div className="missing-keywords">
                      <h4>🔍 Missing Keywords:</h4>
                      <div className="keyword-tags">
                        {jobOptimization.missingKeywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {jobOptimization.sectionRecommendations && (
                    <div className="section-recommendations">
                      <h4>📝 Section Recommendations:</h4>
                      {Object.entries(jobOptimization.sectionRecommendations).map(([section, recommendation]) => (
                        <div key={section} className="recommendation-item">
                          <strong>{section.charAt(0).toUpperCase() + section.slice(1)}:</strong>
                          <p>{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>        {aiSuggestions && (
          <div className="ai-suggestions">
            <h3>🤖 AI Analysis Results</h3>
            
            <div className="suggestion-metrics">
              <div className="metric-card">
                <h4>Overall Score</h4>
                <div className="score">{aiSuggestions.overall_score}/10</div>
              </div>
              <div className="metric-card">
                <h4>ATS Score</h4>
                <div className="score">{aiSuggestions.ats_score || 'N/A'}/100</div>
              </div>
            </div>

            <div className="suggestion-item">
              <h4>📋 Overall Feedback</h4>
              <p>{aiSuggestions.feedback}</p>
            </div>

            {aiSuggestions.summary && (
              <div className="suggestion-item summary-enhancement">
                <h4>✨ Professional Summary Enhancement (Score: {aiSuggestions.summary.score}/10)</h4>
                
                <div className="before-after">
                  <div className="current">
                    <strong>Current Summary:</strong>
                    <p>{aiSuggestions.summary.current || "No summary provided"}</p>
                  </div>
                  <div className="improved">
                    <strong>AI-Enhanced Summary:</strong>
                    <p className="enhanced-summary">{aiSuggestions.summary.improved}</p>
                    <button 
                      onClick={() => handleSummaryChange(aiSuggestions.summary.improved)}
                      className="btn-apply"
                    >
                      🚀 Apply Enhanced Summary
                    </button>
                  </div>
                </div>

                {aiSuggestions.summary.reasoning && (
                  <div className="improvement-reasoning">
                    <h5>💡 Why This Works Better:</h5>
                    <p>{aiSuggestions.summary.reasoning}</p>
                  </div>
                )}

                {aiSuggestions.summary.tips && (
                  <div className="summary-tips">
                    <h5>📝 Summary Writing Tips:</h5>
                    <ul>
                      {aiSuggestions.summary.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.summary.keywords_added && (
                  <div className="keywords-added">
                    <h5>🎯 Keywords Added:</h5>
                    <div className="keyword-tags">
                      {aiSuggestions.summary.keywords_added.map((keyword, index) => (
                        <span key={index} className="added-keyword">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}

                {aiSuggestions.summary.tone_used && (
                  <div className="tone-info">
                    <h5>🎭 Professional Tone:</h5>
                    <p className="tone-description">{aiSuggestions.summary.tone_used}</p>
                  </div>
                )}
              </div>
            )}

            {aiSuggestions.experience && aiSuggestions.experience.length > 0 && (
              <div className="suggestion-item">
                <h4>💼 Experience Improvements</h4>
                <ul className="improvement-list">
                  {aiSuggestions.experience.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiSuggestions.skills && (
              <div className="suggestion-item">
                <h4>🛠️ Skills Recommendations</h4>
                <p>{aiSuggestions.skills.recommendations}</p>
                {aiSuggestions.skills.missing && aiSuggestions.skills.missing.length > 0 && (
                  <div className="missing-skills">
                    <strong>Suggested Skills to Add:</strong>
                    <div className="skill-tags">
                      {aiSuggestions.skills.missing.map((skill, index) => (
                        <span key={index} className="suggested-skill">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiSuggestions.achievements && (
              <div className="suggestion-item">
                <h4>🏆 Achievements Analysis (Impact Score: {aiSuggestions.achievements.impact_score}/10)</h4>
                <div className="achievements-analysis">
                  <div className="analysis-overview">
                    <p><strong>Current Status:</strong> {aiSuggestions.achievements.analysis}</p>
                  </div>
                  
                  {aiSuggestions.achievements.suggestions && (
                    <div className="achievement-suggestions">
                      <h5>💡 Achievement Recommendations:</h5>
                      <ul>
                        {aiSuggestions.achievements.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiSuggestions.achievements.missing_categories && aiSuggestions.achievements.missing_categories.length > 0 && (
                    <div className="missing-achievement-categories">
                      <h5>📋 Consider Adding These Categories:</h5>
                      <div className="category-tags">
                        {aiSuggestions.achievements.missing_categories.map((category, index) => (
                          <span key={index} className="category-suggestion">{category}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {aiSuggestions.strengths && aiSuggestions.strengths.length > 0 && (
              <div className="suggestion-item">
                <h4>💪 Strengths</h4>
                <ul className="strengths-list">
                  {aiSuggestions.strengths.map((strength, index) => (
                    <li key={index} className="strength-item">✅ {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiSuggestions.weaknesses && aiSuggestions.weaknesses.length > 0 && (
              <div className="suggestion-item">
                <h4>🎯 Areas for Improvement</h4>
                <ul className="weaknesses-list">
                  {aiSuggestions.weaknesses.map((weakness, index) => (
                    <li key={index} className="weakness-item">⚠️ {weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiSuggestions.keywords_missing && aiSuggestions.keywords_missing.length > 0 && (
              <div className="suggestion-item">
                <h4>🔍 Missing Keywords</h4>
                <div className="keyword-tags">
                  {aiSuggestions.keywords_missing.map((keyword, index) => (
                    <span key={index} className="missing-keyword">{keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;
