# AI-Powered Resume Builder

A modern, full-stack web application built with the MERN stack that helps users create professional resumes with AI-powered suggestions and optimization.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Resume Editor**: Intuitive drag-and-drop resume builder
- **AI Integration**: Intelligent suggestions for resume improvement
- **Job Optimization**: Optimize resumes for specific job descriptions
- **Multiple Templates**: Professional, ATS-friendly resume templates
- **Real-time Preview**: See changes as you edit
- **Export Options**: Download resumes in PDF format
- **Dashboard**: Manage multiple resumes

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### AI Integration
- Placeholder AI service integration (ready for OpenAI, Anthropic, etc.)
- Content generation and improvement suggestions
- Job description matching and optimization

## 📁 Project Structure

```
resume-builder/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resumes.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js
│   ├── package.json
│   ├── index.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-builder
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/resume_builder
   JWT_SECRET=your_jwt_secret_here
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use MongoDB Atlas.

6. **Run the Application**
   
   In separate terminals:
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm start
   ```

7. **Access the Application**
   
   Open your browser and go to `http://localhost:3000`

## 🔧 Configuration

### Database Setup
The application uses MongoDB to store user data and resumes. You can use either:
- Local MongoDB installation
- MongoDB Atlas (cloud database)

Update the `MONGO_URI` in your `.env` file accordingly.

### AI Integration
The application is fully integrated with **Groq AI** using the `llama-3.1-8b-instant` model for intelligent resume analysis and suggestions:

**Key AI Features:**
- **Personalized Summary Generation**: Creates professional summaries tailored to career level and experience
- **Job Description Matching**: Analyzes job postings and provides optimization recommendations
- **Career Level Intelligence**: Adapts suggestions for entry-level, mid-level, senior, and executive professionals
- **ATS Scoring**: Evaluates resume compatibility with Applicant Tracking Systems
- **Industry-Specific Keywords**: Suggests relevant terms based on your field
- **Professional Tone Analysis**: Adjusts writing style based on career stage

**AI Integration Setup:**
1. Get a Groq API key from [console.groq.com](https://console.groq.com)
2. Get API credentials
3. Update the AI routes in `backend/routes/ai.js`
4. Add API keys to your `.env` file

Example for OpenAI integration:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Resume Endpoints
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get specific resume
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### AI Endpoints
- `POST /api/ai/improve-resume` - Get AI improvement suggestions
- `POST /api/ai/optimize-for-job` - Optimize resume for job description
- `POST /api/ai/generate-content` - Generate content for resume sections

## 🎨 Features in Detail

### Resume Editor
- **Personal Information**: Contact details and social profiles
- **Professional Summary**: AI-assisted summary generation
- **Work Experience**: Detailed work history with achievements
- **Education**: Academic background
- **Skills**: Categorized technical and soft skills
- **Projects**: Portfolio projects with descriptions
- **Certifications**: Professional certifications

### AI Features
- **Content Improvement**: Suggestions to enhance resume content
- **Job Matching**: Analyze job descriptions and suggest optimizations
- **Keyword Optimization**: Ensure ATS compatibility
- **Writing Assistance**: Generate professional content

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Saving**: Auto-save functionality
- **Multiple Resumes**: Create and manage multiple resume versions
- **Template Selection**: Choose from professional templates

## 🚀 Deployment

### Backend Deployment (e.g., Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git or GitHub integration

### Frontend Deployment (e.g., Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder
3. Configure API URL for production

### Database
Use MongoDB Atlas for production database hosting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- OpenAI for AI inspiration
- All contributors and testers

## 📞 Support

For support, email support@resumebuilder.com or create an issue in the repository.

---

Built with ❤️ using the MERN stack