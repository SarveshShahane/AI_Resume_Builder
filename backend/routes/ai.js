const express = require('express');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_KEY,
});

router.post('/improve-resume', auth, async (req, res) => {
  try {
    const { resumeData } = req.body;
    
    const experienceYears = resumeData.experience?.reduce((total, exp) => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate === 'Present' || exp.endDate === 'Current' ? new Date() : new Date(exp.endDate);
        return total + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365));
      }
      return total;
    }, 0) || 0;
    
    const careerLevel = experienceYears < 2 ? 'entry-level' : 
                       experienceYears < 5 ? 'mid-level' : 
                       experienceYears < 10 ? 'senior-level' : 'executive-level';
    
    const industries = resumeData.experience?.map(exp => exp.company || exp.position).filter(Boolean).join(', ') || 'various industries';
    const keySkills = Array.isArray(resumeData.skills) ? resumeData.skills.slice(0, 5).join(', ') : 'technical skills';
    const education = resumeData.education?.[0]?.degree || 'relevant education';

    const prompt = `Analyze this resume and provide detailed improvement suggestions with special focus on creating an outstanding professional summary:

CANDIDATE PROFILE:
- Career Level: ${careerLevel}
- Years of Experience: ${Math.round(experienceYears)}
- Industry Background: ${industries}
- Key Skills: ${keySkills}
- Education: ${education}

RESUME DATA:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Summary: ${resumeData.summary || "No summary provided"}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}
Skills: ${JSON.stringify(resumeData.skills)}
Projects: ${JSON.stringify(resumeData.projects)}
Achievements: ${JSON.stringify(resumeData.achievements || [])}

INSTRUCTIONS FOR SUMMARY IMPROVEMENT:
1. Create a compelling 2-3 sentence professional summary
2. Include quantifiable achievements when possible
3. Use industry-specific keywords and action verbs
4. Highlight unique value proposition
5. Match tone to career level (${careerLevel})
6. Focus on what makes this candidate stand out
7. Make it ATS-friendly with relevant keywords

Respond ONLY with valid JSON in this exact format:
{
  "overall_score": 8.5,
  "feedback": "Comprehensive assessment of the resume's current state and overall potential",
  "summary": {
    "current": "current summary text or null",
    "improved": "professionally crafted, compelling summary with quantified achievements and industry keywords",
    "score": 8.0,
    "reasoning": "detailed explanation of what was improved and why",
    "tips": [
      "specific actionable tip for summary writing",
      "another specific tip for improvement",
      "third tip for making summary more impactful"
    ],
    "keywords_added": ["keyword1", "keyword2", "keyword3"],
    "tone_used": "description of professional tone used"
  },
  "skills": {
    "missing": ["skill1", "skill2", "skill3"],
    "recommendations": "specific recommendations for skill improvements"
  },
  "experience": [
    "improvement suggestion 1",
    "improvement suggestion 2",
    "improvement suggestion 3"
  ],
  "achievements": {
    "analysis": "assessment of current achievements and their effectiveness",
    "suggestions": [
      "specific achievement to highlight or add",
      "how to quantify existing accomplishments",
      "categories missing from achievement portfolio"
    ],
    "missing_categories": ["Professional", "Leadership", "Technical"],
    "impact_score": 7.5
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "ats_score": 85,
  "keywords_missing": ["keyword1", "keyword2"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer and career coach. Provide detailed, actionable feedback to improve resumes. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    let suggestions;
    try {
      const content = completion.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      suggestions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      const personalizedSummary = generatePersonalizedSummary(resumeData, careerLevel, experienceYears, keySkills);
      
      suggestions = {
        overall_score: 7.5,
        feedback: `Your resume shows strong potential for a ${careerLevel} professional. Focus on quantifying achievements, incorporating industry-specific keywords, and creating a more compelling professional summary to improve ATS compatibility and recruiter appeal.`,
        summary: {
          current: resumeData.summary || null,
          improved: personalizedSummary.improved,
          score: personalizedSummary.score,
          reasoning: personalizedSummary.reasoning,
          tips: [
            "Start with your strongest professional identifier and years of experience",
            "Include 1-2 quantified achievements that demonstrate your impact",
            "End with your career objective or unique value proposition",
            "Use action verbs and industry-specific keywords throughout"
          ],
          keywords_added: personalizedSummary.keywords,
          tone_used: personalizedSummary.tone
        },
        skills: {
          missing: generateMissingSkills(resumeData, careerLevel),
          recommendations: `For a ${careerLevel} professional, focus on both technical competencies and leadership skills. Include trending technologies and methodologies relevant to your industry.`
        },
        experience: [
          "Begin each bullet point with powerful action verbs (Spearheaded, Optimized, Architected, Transformed)",
          "Quantify achievements with specific metrics (increased efficiency by 25%, managed $2M budget, led team of 15)",
          "Highlight business impact and results rather than just daily tasks",
          "Include industry-specific keywords and technologies from target job descriptions",
          "Show progression of responsibilities and increasing impact over time"
        ],
        achievements: generateAchievementsAnalysis(resumeData, careerLevel),
        strengths: generateStrengths(resumeData),
        weaknesses: generateWeaknesses(resumeData),
        ats_score: 72,
        keywords_missing: generateMissingKeywords(resumeData, careerLevel)
      };
    }
    
    res.json({
      message: 'Resume analysis completed',
      suggestions
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

router.post('/optimize-for-job', auth, async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    
    const prompt = `Analyze this resume against the job description and provide optimization suggestions:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Summary: ${resumeData.summary}
Experience: ${JSON.stringify(resumeData.experience)}
Skills: ${JSON.stringify(resumeData.skills)}

Please provide a JSON response with:
1. matchScore (percentage match out of 100)
2. keywordSuggestions (array of important keywords from job description)
3. missingKeywords (array of keywords resume is missing)
4. sectionRecommendations (object with summary, experience, skills recommendations)
5. priorityActions (array of top 3 most important changes)

Focus on ATS optimization and keyword matching.

Respond ONLY with valid JSON in this exact format:
{
  "matchScore": 82,
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3"],
  "missingKeywords": ["missing1", "missing2"],
  "sectionRecommendations": {
    "summary": "specific recommendation for summary",
    "experience": "specific recommendation for experience",
    "skills": "specific recommendation for skills"
  },
  "priorityActions": ["action1", "action2", "action3"],
  "atsOptimization": {
    "score": 75,
    "improvements": ["improvement1", "improvement2"]
  },
  "industryAlignment": "assessment of industry fit"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an ATS and resume optimization expert. Analyze job descriptions and resumes to provide specific optimization recommendations. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    let optimization;
    try {
      const content = completion.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      optimization = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      optimization = {
        matchScore: 75,
        keywordSuggestions: ["Leadership", "Project Management", "Team Collaboration", "Strategic Planning"],
        missingKeywords: ["Agile", "Scrum", "Data Analytics", "Cross-functional"],
        sectionRecommendations: {
          summary: "Incorporate 3-4 key terms from the job description. Highlight relevant years of experience and core competencies.",
          experience: "Reorganize bullet points to emphasize achievements that match job requirements. Use similar language to the job posting.",
          skills: "Add both technical and soft skills mentioned in the job description. Group similar skills together."
        },
        priorityActions: [
          "Add missing technical skills from job description",
          "Rewrite summary to include job-specific keywords",
          "Quantify achievements with metrics that matter to this role"
        ],
        atsOptimization: {
          score: 78,
          improvements: [
            "Use exact keyword phrases from job description",
            "Ensure proper formatting for ATS scanning"
          ]
        },
        industryAlignment: "Good foundational match. Strengthen with industry-specific terminology and relevant certifications."
      };
    }
    
    res.json({
      message: 'Job optimization analysis completed',
      optimization
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

router.post('/generate-content', auth, async (req, res) => {
  try {
    const { section, context } = req.body;
    
    let prompt = '';
    let systemMessage = '';
    
    switch (section) {
      case 'summary':
        systemMessage = "You are an expert resume writer. Create compelling, professional summaries that highlight achievements and value proposition.";
        prompt = `Create a professional summary for a resume based on this context:
        
Personal Info: ${JSON.stringify(context.personalInfo)}
Experience: ${JSON.stringify(context.experience)}
Skills: ${JSON.stringify(context.skills)}

Write a 2-3 sentence professional summary that:
- Highlights key strengths and experience
- Includes quantifiable achievements where possible
- Uses action-oriented language
- Is ATS-friendly

Return only the summary text, no additional formatting.`;
        break;
        
      case 'experience':
        systemMessage = "You are an expert resume writer specializing in achievement-focused experience descriptions.";
        prompt = `Generate 3-4 bullet points for a work experience entry based on this context:
        
Context: ${JSON.stringify(context)}

Each bullet point should:
- Start with a strong action verb
- Include quantifiable results when possible
- Focus on achievements rather than responsibilities
- Be concise and impactful

Return only the bullet points, one per line, starting with •`;
        break;
        
      case 'skills':
        systemMessage = "You are a career expert who knows trending skills across industries.";
        prompt = `Suggest relevant skills based on this resume context:
        
Current Skills: ${JSON.stringify(context.skills)}
Experience: ${JSON.stringify(context.experience)}
Industry/Role context: ${JSON.stringify(context.personalInfo)}

Provide a comma-separated list of 8-12 relevant skills including:
- Technical skills appropriate for the role
- Trending technologies in the field
- Soft skills that complement the technical skills

Return only the comma-separated skills list.`;
        break;
        
      case 'achievements':
        systemMessage = "You are an expert resume writer specializing in highlighting professional achievements and awards.";
        prompt = `Generate 3-5 professional achievements based on this resume context:
        
Personal Info: ${JSON.stringify(context.personalInfo)}
Experience: ${JSON.stringify(context.experience)}
Skills: ${JSON.stringify(context.skills)}
Education: ${JSON.stringify(context.education)}
Current Achievements: ${JSON.stringify(context.achievements)}

Create achievements that:
- Are based on the candidate's experience and skills
- Include quantifiable metrics when possible
- Cover different categories (Professional, Technical, Leadership, etc.)
- Show career progression and impact
- Are credible and realistic for this candidate's level

Return a JSON array of achievement objects with this format:
[
  {
    "title": "Achievement title",
    "description": "Detailed description of what was accomplished",
    "category": "Professional/Academic/Leadership/Technical/Innovation",
    "metrics": "Quantifiable results (e.g., 25% improvement, $50K saved)",
    "impact": "Business or organizational impact"
  }
]`;
        break;
        
      default:
        prompt = `Generate professional content for the ${section} section of a resume based on: ${JSON.stringify(context)}`;
        systemMessage = "You are an expert resume writer.";
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const generatedContent = completion.choices[0].message.content.trim();
    
    res.json({
      message: 'Content generated successfully',
      content: generatedContent,
      section
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

router.post('/improve-achievement', auth, async (req, res) => {
  try {
    const { achievement, resumeContext } = req.body;
    
    if (!achievement || !achievement.trim()) {
      return res.status(400).json({ error: 'Achievement text is required' });
    }

    const experienceYears = resumeContext.experience?.reduce((total, exp) => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate === 'Present' || exp.endDate === 'Current' ? new Date() : new Date(exp.endDate);
        return total + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365));
      }
      return total;
    }, 0) || 0;
    
    const careerLevel = experienceYears < 2 ? 'entry-level' : 
                       experienceYears < 5 ? 'mid-level' : 
                       experienceYears < 10 ? 'senior-level' : 'executive-level';

    const prompt = `Improve this achievement statement to make it more impactful and professional:

ORIGINAL ACHIEVEMENT: "${achievement}"

CANDIDATE CONTEXT:
- Career Level: ${careerLevel}
- Years of Experience: ${Math.round(experienceYears)}
- Industry: ${resumeContext.experience?.[0]?.company || 'Various'}
- Skills: ${Array.isArray(resumeContext.skills) ? resumeContext.skills.slice(0, 3).join(', ') : 'Various skills'}

IMPROVEMENT GUIDELINES:
1. Start with a strong action verb
2. Add specific metrics/numbers if possible (if not in original, suggest realistic ones)
3. Include the impact or benefit
4. Use professional language appropriate for ${careerLevel}
5. Keep it concise but impactful
6. Make it quantifiable and results-focused

IMPORTANT: Only return the improved achievement text, nothing else. Do not add quotes or extra formatting.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer who specializes in transforming basic achievement statements into powerful, quantified accomplishments that impress recruiters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    let improved;
    try {
      improved = completion.choices[0].message.content.trim();
      improved = improved.replace(/^["']|["']$/g, '');
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      improved = `Enhanced ${achievement} with measurable impact and professional language`;
    }
    
    res.json({
      message: 'Achievement improved successfully',
      original: achievement,
      improved: improved
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

function generatePersonalizedSummary(resumeData, careerLevel, experienceYears, keySkills) {
  const name = resumeData.personalInfo?.firstName || 'Professional';
  const currentSummary = resumeData.summary || '';
  
  let improved, reasoning, tone, keywords;
  
  switch (careerLevel) {
    case 'entry-level':
      improved = `Motivated ${resumeData.personalInfo?.firstName || 'professional'} with ${Math.round(experienceYears)} year${experienceYears !== 1 ? 's' : ''} of experience in ${extractField(resumeData)}. Demonstrated proficiency in ${keySkills} with a strong foundation in ${extractEducationFocus(resumeData)}. Eager to contribute fresh perspectives and technical skills to drive organizational success.`;
      reasoning = 'Focused on potential, education, and eagerness to learn - ideal for entry-level positions';
      tone = 'enthusiastic and growth-oriented';
      keywords = ['motivated', 'demonstrated', 'proficiency', 'foundation'];
      break;
      
    case 'mid-level':
      improved = `Experienced ${extractProfession(resumeData)} with ${Math.round(experienceYears)} years of progressive experience delivering measurable results in ${extractField(resumeData)}. Proven expertise in ${keySkills} with a track record of ${extractAchievement(resumeData)}. Seeking to leverage analytical and leadership skills to drive strategic initiatives.`;
      reasoning = 'Emphasizes progressive experience and proven results - perfect for mid-level roles';
      tone = 'confident and results-focused';
      keywords = ['experienced', 'progressive', 'measurable', 'proven', 'strategic'];
      break;
      
    case 'senior-level':
      improved = `Senior ${extractProfession(resumeData)} with ${Math.round(experienceYears)}+ years of executive experience leading high-impact initiatives in ${extractField(resumeData)}. Expert in ${keySkills} with demonstrated success in ${extractLeadershipAchievement(resumeData)}. Committed to driving organizational transformation and building high-performing teams.`;
      reasoning = 'Highlights leadership, strategic thinking, and organizational impact';
      tone = 'authoritative and strategic';
      keywords = ['senior', 'executive', 'expert', 'demonstrated', 'transformation'];
      break;
      
    default: 
      improved = `Executive leader with ${Math.round(experienceYears)}+ years of transformational experience in ${extractField(resumeData)}. Recognized expertise in ${keySkills} with a proven record of ${extractExecutiveAchievement(resumeData)}. Passionate about driving innovation, scaling operations, and delivering exceptional stakeholder value.`;
      reasoning = 'Focuses on transformation, innovation, and stakeholder value creation';
      tone = 'visionary and impact-driven';
      keywords = ['executive', 'transformational', 'recognized', 'innovation', 'stakeholder'];
      break;
  }
  
  return {
    improved,
    score: currentSummary ? 8.5 : 9.0,
    reasoning,
    tone,
    keywords
  };
}

function extractField(resumeData) {
  if (resumeData.experience && resumeData.experience.length > 0) {
    const recentRole = resumeData.experience[0];
    if (recentRole.position) {
      const position = recentRole.position.toLowerCase();
      if (position.includes('engineer') || position.includes('developer')) return 'software development';
      if (position.includes('manager') || position.includes('lead')) return 'team leadership';
      if (position.includes('marketing')) return 'digital marketing';
      if (position.includes('sales')) return 'sales and business development';
      if (position.includes('design')) return 'product design';
      if (position.includes('analyst')) return 'data analysis';
    }
  }
  return 'technology and innovation';
}

function extractProfession(resumeData) {
  if (resumeData.experience && resumeData.experience.length > 0) {
    const position = resumeData.experience[0].position || '';
    if (position.includes('Engineer')) return 'Software Engineer';
    if (position.includes('Manager')) return 'Manager';
    if (position.includes('Developer')) return 'Developer';
    if (position.includes('Analyst')) return 'Analyst';
    if (position.includes('Designer')) return 'Designer';
  }
  return 'Professional';
}

function extractEducationFocus(resumeData) {
  if (resumeData.education && resumeData.education.length > 0) {
    const degree = resumeData.education[0].degree || '';
    if (degree.includes('Computer')) return 'computer science fundamentals';
    if (degree.includes('Business')) return 'business principles';
    if (degree.includes('Engineering')) return 'engineering principles';
    if (degree.includes('Marketing')) return 'marketing strategies';
  }
  return 'core academic principles';
}

function extractAchievement(resumeData) {
  const achievements = [
    'improving operational efficiency',
    'delivering projects on time and under budget',
    'enhancing user experience and satisfaction',
    'streamlining processes and workflows',
    'collaborating across cross-functional teams'
  ];
  return achievements[Math.floor(Math.random() * achievements.length)];
}

function extractLeadershipAchievement(resumeData) {
  const achievements = [
    'leading cross-functional teams to exceed performance targets',
    'implementing strategic initiatives that improved business outcomes',
    'mentoring junior professionals and fostering team growth',
    'optimizing processes that increased efficiency by 25%+',
    'driving digital transformation initiatives'
  ];
  return achievements[Math.floor(Math.random() * achievements.length)];
}

function extractExecutiveAchievement(resumeData) {
  const achievements = [
    'scaling organizations from startup to enterprise level',
    'leading digital transformation initiatives worth $10M+',
    'building and managing high-performing teams of 50+ professionals',
    'developing strategic partnerships that increased revenue by 40%+',
    'implementing operational excellence programs across multiple divisions'
  ];
  return achievements[Math.floor(Math.random() * achievements.length)];
}

function generateMissingSkills(resumeData, careerLevel) {
  const skillSets = {
    'entry-level': ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability'],
    'mid-level': ['Leadership', 'Project Management', 'Strategic Thinking', 'Mentoring', 'Process Improvement'],
    'senior-level': ['Executive Leadership', 'Strategic Planning', 'Change Management', 'Stakeholder Management', 'Business Development'],
    'executive-level': ['Organizational Transformation', 'Board Relations', 'M&A Experience', 'Global Market Expansion', 'Cultural Leadership']
  };
  
  return skillSets[careerLevel] || skillSets['mid-level'];
}

function generateStrengths(resumeData) {
  const strengths = ['Technical expertise', 'Professional experience', 'Educational background'];
  
  if (resumeData.experience && resumeData.experience.length > 2) {
    strengths.push('Diverse industry experience');
  }
  
  if (resumeData.skills && resumeData.skills.length > 5) {
    strengths.push('Comprehensive skill set');
  }
  
  if (resumeData.projects && resumeData.projects.length > 0) {
    strengths.push('Project portfolio demonstrates practical application');
  }
  
  return strengths.slice(0, 4);
}

function generateWeaknesses(resumeData) {
  const weaknesses = [];
  
  if (!resumeData.summary || resumeData.summary.length < 50) {
    weaknesses.push('Professional summary needs more impact and quantification');
  }
  
  if (!resumeData.certifications || resumeData.certifications.length === 0) {
    weaknesses.push('Missing industry certifications or professional development');
  }
  
  if (resumeData.experience && resumeData.experience.some(exp => 
    !exp.responsibilities || exp.responsibilities.length < 100)) {
    weaknesses.push('Experience descriptions lack quantified achievements');
  }
  
  if (!resumeData.skills || resumeData.skills.length < 8) {
    weaknesses.push('Limited technical and soft skills representation');
  }
  
  return weaknesses.slice(0, 3);
}

function generateMissingKeywords(resumeData, careerLevel) {
  const keywordSets = {
    'entry-level': ['Collaboration', 'Learning', 'Innovation', 'Results-oriented'],
    'mid-level': ['Leadership', 'Strategic', 'Cross-functional', 'Optimization'],
    'senior-level': ['Executive', 'Transformation', 'Stakeholder', 'Vision'],
    'executive-level': ['C-Suite', 'Board', 'Organizational', 'Market Leadership']
  };
  
  return keywordSets[careerLevel] || keywordSets['mid-level'];
}

function generateAchievementsAnalysis(resumeData, careerLevel) {
  const currentAchievements = resumeData.achievements || [];
  const achievementCount = currentAchievements.length;
  
  const analysis = achievementCount === 0 
    ? `No achievements currently listed. Adding a dedicated achievements section can significantly strengthen your resume by highlighting specific accomplishments and measurable results.`
    : `Found ${achievementCount} achievement${achievementCount > 1 ? 's' : ''}. Consider expanding this section with more quantified results and diverse achievement categories.`;

  const suggestions = {
    'entry-level': [
      'Highlight academic achievements, internship successes, or project accomplishments',
      'Include any awards, recognitions, or standout performance metrics from school or early career',
      'Focus on learning achievements and skill development milestones'
    ],
    'mid-level': [
      'Quantify professional achievements with specific metrics (cost savings, efficiency improvements, revenue impact)',
      'Include team leadership accomplishments and process improvement initiatives',
      'Highlight certifications earned and professional development achievements'
    ],
    'senior-level': [
      'Showcase strategic initiative successes and organizational impact',
      'Include industry recognition, speaking engagements, or thought leadership achievements',
      'Quantify large-scale project successes and team building accomplishments'
    ],
    'executive-level': [
      'Highlight transformation achievements and market expansion successes',
      'Include board appointments, industry awards, and high-level strategic wins',
      'Showcase company growth achievements and stakeholder value creation'
    ]
  };

  const missingCategories = [];
  const existingCategories = currentAchievements.map(a => a.category || 'Professional');
  
  const allCategories = ['Professional', 'Leadership', 'Technical', 'Innovation', 'Academic', 'Community'];
  allCategories.forEach(category => {
    if (!existingCategories.includes(category)) {
      missingCategories.push(category);
    }
  });

  const impactScore = achievementCount === 0 ? 3.0 : 
                     achievementCount < 3 ? 6.0 : 
                     achievementCount < 5 ? 8.0 : 9.0;

  return {
    analysis,
    suggestions: suggestions[careerLevel] || suggestions['mid-level'],
    missing_categories: missingCategories.slice(0, 3),
    impact_score: impactScore
  };
}

module.exports = router;