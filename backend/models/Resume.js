const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String }
  },
  summary: {
    type: String,
    maxlength: 500
  },
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
    achievements: [String]
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    gpa: { type: String }
  }],
  skills: [{
    category: { type: String, required: true },
    items: [String]
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String },
    technologies: [String],
    link: { type: String },
    github: { type: String }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String },
    date: { type: Date },
    link: { type: String }
  }],
  achievements: [{
    description: { type: String, required: true }
  }],
  template: {
    type: String,
    default: 'modern'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);