@echo off
echo 🚀 Setting up AI Resume Builder...

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install

cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start the development servers:
echo    npm run dev (from root directory)
echo.
echo 🌐 Frontend will run on: http://localhost:3000
echo 🔧 Backend will run on: http://localhost:5000
echo.
echo 📝 Don't forget to:
echo    1. Start MongoDB service
echo    2. Update .env file in backend directory
echo    3. Configure AI API keys (optional)

pause