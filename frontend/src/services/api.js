import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (resumeData) => api.post('/resumes', resumeData),
  update: (id, resumeData) => api.put(`/resumes/${id}`, resumeData),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const aiAPI = {
  improveResume: (resumeData) => api.post('/ai/improve-resume', { resumeData }),
  optimizeForJob: (resumeData, jobDescription) => 
    api.post('/ai/optimize-for-job', { resumeData, jobDescription }),
  generateContent: (section, context) => 
    api.post('/ai/generate-content', { section, context }),
  improveAchievement: (achievement, resumeContext) =>
    api.post('/ai/improve-achievement', { achievement, resumeContext }),
};

export default api;