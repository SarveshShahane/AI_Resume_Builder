import React, { useState, useRef } from 'react';

const ResumePreview = ({ resume, onColorChange }) => {
  const [colors, setColors] = useState({
    primary: '#2563eb',      
    secondary: '#475569',    
    accent: '#059669',       
    border: '#d1d5db',      
    text: '#111827'         
  });

  const componentRef = useRef();

  const handlePrint = () => {
    const printContent = componentRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.personalInfo?.fullName || 'Resume'}_Resume</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
            }
            ${getResumeStyles()}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getResumeStyles = () => {
    return `
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.6;
        color: ${colors.text};
        margin: 0;
        padding: 20px;
        background: white;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      @page {
        size: A4;
        margin: 0.5in;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      .resume-content {
        padding: 0;
        width: 100%;
        min-height: auto;
      }
      
      .resume-name {
        font-size: 2.5rem;
        font-weight: bold;
        color: ${colors.primary};
        margin-bottom: 0.5rem;
        letter-spacing: 1px;
        text-align: center;
        text-transform: uppercase;
      }
      
      .resume-contact, .resume-links {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      
      .contact-item {
        color: ${colors.secondary};
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .contact-icon {
        font-size: 1rem;
      }
      
      .link-item {
        color: ${colors.accent} !important;
        text-decoration: none !important;
        font-weight: 500;
        font-size: 0.95rem;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .link-item:hover {
        text-decoration: underline !important;
      }
      
      .additional-links {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      
      .contact-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .contact-left, .contact-right {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .contact-right {
        align-items: flex-end;
      }
      
      @media print {
        .link-item {
          color: ${colors.accent} !important;
          text-decoration: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      .header-line {
        height: 3px;
        background: linear-gradient(to right, ${colors.primary}, ${colors.accent});
        border-radius: 2px;
        margin: 1rem auto;
        width: 60%;
      }
      
      .section-title {
        font-size: 1.4rem;
        font-weight: bold;
        color: ${colors.primary};
        margin: 2rem 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid ${colors.primary};
        padding-bottom: 0.25rem;
      }
      
      .section-line {
        height: 2px;
        background: ${colors.border};
        margin-bottom: 1rem;
        border-radius: 1px;
      }
      
      .experience-item, .education-item, .project-item, .certification-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid ${colors.border};
        page-break-inside: avoid;
      }
      
      .position, .degree, .project-name, .cert-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: ${colors.primary};
        margin: 0 0 0.25rem 0;
      }
      
      .company, .institution {
        font-size: 1rem;
        color: ${colors.secondary};
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .exp-dates, .edu-dates, .cert-date {
        color: ${colors.accent};
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      
      .skill-tag {
        background: ${colors.primary} !important;
        color: white !important;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        display: inline-block;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .skill-category-title {
        font-size: 1rem;
        font-weight: bold;
        color: ${colors.primary};
        margin-bottom: 0.5rem;
      }
      
      .achievements-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .achievement-item-simple {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
        page-break-inside: avoid;
      }
      
      .achievement-bullet {
        color: ${colors.primary};
        font-weight: bold;
        font-size: 1.2rem;
        margin-top: 0.1rem;
        flex-shrink: 0;
      }
      
      .achievement-text {
        color: ${colors.text};
        line-height: 1.6;
        margin: 0;
        flex: 1;
      }
      
      .resume-summary {
        text-align: center;
        font-style: italic;
        color: ${colors.secondary};
        margin: 1rem 0 2rem 0;
        padding: 0 2rem;
        line-height: 1.7;
      }
      
      .resume-section {
        margin-bottom: 2rem;
        page-break-inside: avoid;
      }
      
      .resume-content {
        max-width: 100%;
        margin: 0 auto;
        padding: 0;
        background: white;
      }
    `;
  };

  const handleColorChange = (colorType, value) => {
    const newColors = { ...colors, [colorType]: value };
    setColors(newColors);
    if (onColorChange) onColorChange(newColors);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="resume-preview-container">
      <div className="color-panel no-print">
        <h3>Customize Colors</h3>
        <div className="color-controls">
          <div className="color-control">
            <label>Primary Color:</label>
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
            />
          </div>
          <div className="color-control">
            <label>Secondary Color:</label>
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
            />
          </div>
          <div className="color-control">
            <label>Accent Color:</label>
            <input
              type="color"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
            />
          </div>
          <div className="color-control">
            <label>Border Color:</label>
            <input
              type="color"
              value={colors.border}
              onChange={(e) => handleColorChange('border', e.target.value)}
            />
          </div>
        </div>
        <button onClick={handlePrint} className="btn-print">
          🖨️ Print Resume
        </button>
      </div>

      <div 
        ref={componentRef} 
        className="resume-content"
        style={{
          '--primary-color': colors.primary,
          '--secondary-color': colors.secondary,
          '--accent-color': colors.accent,
          '--border-color': colors.border,
          '--text-color': colors.text
        }}
      >
        <div className="resume-header">
          <h1 className="resume-name">{resume.personalInfo?.fullName || 'Your Name'}</h1>
          
          <div className="contact-info-grid">
            <div className="contact-left">
              {resume.personalInfo?.email && (
                <div className="contact-item">
                  <span className="contact-icon">✉</span>
                  <span>{resume.personalInfo.email}</span>
                </div>
              )}
              {resume.personalInfo?.phone && (
                <div className="contact-item">
                  <span className="contact-icon">☎</span>
                  <span>{resume.personalInfo.phone}</span>
                </div>
              )}
            </div>
            <div className="contact-right">
              {resume.personalInfo?.location && (
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>{resume.personalInfo.location}</span>
                </div>
              )}
              {resume.personalInfo?.linkedin && (
                <div className="contact-item">
                  <span className="contact-icon">�</span>
                  <span>{resume.personalInfo.linkedin.replace('https://linkedin.com/in/', '')}</span>
                </div>
              )}
            </div>
          </div>
          
          {(resume.personalInfo?.github || resume.personalInfo?.website) && (
            <div className="additional-links">
              {resume.personalInfo?.github && (
                <a href={resume.personalInfo.github} className="link-item" target="_blank" rel="noopener noreferrer">
                  GitHub: {resume.personalInfo.github.replace('https://github.com/', '').replace(/\/$/, '')}
                </a>
              )}
              {resume.personalInfo?.website && (
                <a href={resume.personalInfo.website} className="link-item" target="_blank" rel="noopener noreferrer">
                  Portfolio: {resume.personalInfo.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          )}
          
          <div className="header-line"></div>
        </div>

        {resume.summary && (
          <div className="resume-section">
            <h2 className="section-title">Professional Summary</h2>
            <div className="section-line"></div>
            <p className="summary-text">{resume.summary}</p>
          </div>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Professional Experience</h2>
            <div className="section-line"></div>
            {resume.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="exp-header">
                  <div className="exp-title">
                    <h3 className="position">{exp.position}</h3>
                    <span className="company">{exp.company}</span>
                  </div>
                  <div className="exp-dates">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <p className="exp-description">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="achievements">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.education && resume.education.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Education</h2>
            <div className="section-line"></div>
            {resume.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="edu-header">
                  <div className="edu-title">
                    <h3 className="degree">{edu.degree}</h3>
                    <span className="institution">{edu.institution}</span>
                  </div>
                  <div className="edu-dates">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                </div>
                {edu.field && <p className="field-of-study">Field: {edu.field}</p>}
                {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Skills</h2>
            <div className="section-line"></div>
            <div className="skills-grid">
              {resume.skills.map((skillCategory, index) => (
                <div key={index} className="skill-category">
                  <h4 className="skill-category-title">{skillCategory.category}</h4>
                  <div className="skill-items">
                    {skillCategory.items.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.achievements && resume.achievements.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">🏆 Achievements & Awards</h2>
            <div className="section-line"></div>
            <div className="achievements-list">
              {resume.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item-simple">
                  <div className="achievement-bullet">•</div>
                  <p className="achievement-text">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Projects</h2>
            <div className="section-line"></div>
            {resume.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-header">
                  <h3 className="project-name">{project.name}</h3>
                  <div className="project-links">
                    {project.link && <span className="project-link">🔗 {project.link}</span>}
                    {project.github && <span className="project-link">💻 {project.github}</span>}
                  </div>
                </div>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-technologies">
                    <strong>Technologies: </strong>
                    {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Certifications</h2>
            <div className="section-line"></div>
            {resume.certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <div className="cert-header">
                  <h3 className="cert-name">{cert.name}</h3>
                  <span className="cert-date">{formatDate(cert.date)}</span>
                </div>
                {cert.issuer && <p className="cert-issuer">Issued by: {cert.issuer}</p>}
                {cert.link && <p className="cert-link">🔗 {cert.link}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;