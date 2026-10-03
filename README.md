Learning Management System (LMS)

A full-stack Learning Management System (LMS) developed as an individual major project during the Full Stack Development Internship at Quillance Infotech Pvt. Ltd.

The system provides separate functionality for Students and Administrators. Students can register, enroll in courses, access learning modules, track progress, view assignments, and submit assignments. Administrators can manage students, courses, modules, assignments, and submissions.

📌 Project Overview

The Learning Management System is a web-based application designed to manage online learning activities in one centralized platform.

The project demonstrates the integration of:

Frontend development
Backend development
REST APIs
MongoDB database
User authentication
Role-based authorization
Course management
Course enrollment
Learning modules
Assignment management
Assignment submission
Progress tracking
Student and Admin dashboards
🎯 Objectives

The main objectives of this project are:

To develop a complete full-stack web application.
To implement secure user registration and login.
To provide separate Student and Admin roles.
To manage courses and learning modules.
To allow students to enroll in courses.
To track student learning progress.
To manage assignments and submissions.
To provide an admin dashboard for managing the system.
To integrate frontend, backend, and MongoDB.
✨ Features
👨‍🎓 Student Features
Student Registration
Student Login
Student Dashboard
Browse Courses
Course Enrollment
My Courses
Course Details
Learning Modules
Learning Resources
Module Completion
Course Progress Tracking
Assignment Viewing
Assignment Submission
Student Profile
Settings
Light/Dark Theme
Logout
👨‍💼 Admin Features
Admin Login
Admin Dashboard
Student Management
Course Management
Module Management
Assignment Management
Submission Management
Assignment Evaluation
Marks and Feedback
Student Progress Monitoring
Admin Profile
🛠️ Technology Stack
Frontend
HTML5
CSS3
JavaScript
Font Awesome
Backend
Node.js
Express.js
Database
MongoDB
Mongoose
Authentication & Security
JSON Web Token (JWT)
bcryptjs
API Testing
Thunder Client
Development Tools
Visual Studio Code
Git
GitHub
npm
🏗️ System Architecture:
                    USER
                      |
                      ↓
              ┌───────────────┐
              │   FRONTEND    │
              │ HTML/CSS/JS   │
              └───────┬───────┘
                      |
                  REST APIs
                      |
                      ↓
              ┌───────────────┐
              │    BACKEND    │
              │ Node.js       │
              │ Express.js    │
              └───────┬───────┘
                      |
                  Mongoose
                      |
                      ↓
              ┌───────────────┐
              │   MongoDB     │
              │   Database    │
              └───────────────┘
📂 Project Structure
Learning_Management_System/
│
├── client/
│   ├── index.html
│   ├── register.html
│   ├── student.html
│   ├── courses.html
│   ├── my-courses.html
│   ├── course.html
│   ├── assignments.html
│   ├── assignment.html
│   ├── profile.html
│   ├── settings.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── register.js
│       ├── student.js
│       ├── courses.js
│       ├── my-courses.js
│       ├── course.js
│       ├── assignments.js
│       ├── assignment.js
│       ├── profile.js
│       └── settings.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
🗄️ Database Structure

The application uses MongoDB with the following main collections:

Users
Courses
Enrollments
Modules
ModuleProgress
Assignments
Submissions
Users

Stores student and administrator accounts.

Courses

Stores course information such as title, description, category, instructor, duration, and difficulty.

Enrollments

Stores the relationship between students and courses.

Modules

Stores individual learning modules belonging to courses.

ModuleProgress

Stores module completion status for each student.

Assignments

Stores course-specific assignments and deadlines.

Submissions

Stores student assignment submissions, marks, feedback, and evaluation status.

🔐 Authentication

The project uses JWT-based authentication.

After successful login, the server generates a JWT containing user information such as:

User ID
Role

Protected APIs require the authentication token.

Example:

Authorization: Bearer <JWT_TOKEN>

Passwords are hashed using bcryptjs before being stored in the database.

👥 User Roles

The application supports two roles.

Student

Students can:

Register
   ↓
Login
   ↓
Browse Courses
   ↓
Enroll in Course
   ↓
Access Modules
   ↓
Complete Modules
   ↓
Track Progress
   ↓
View Assignments
   ↓
Submit Assignment
Admin

Administrators can:

Login
   ↓
Admin Dashboard
   ↓
Manage Students
   ↓
Manage Courses
   ↓
Manage Modules
   ↓
Manage Assignments
   ↓
View Submissions
   ↓
Evaluate Submissions
   ↓
Monitor Progress
🚀 Installation and Setup
1. Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL

Move into the project folder:

cd Learning_Management_System
2. Install Dependencies

Run:

npm install

This installs the required backend dependencies.

3. Configure MongoDB

Make sure MongoDB is installed and running on your computer.

The project currently uses a local MongoDB database.

Example database connection:

mongodb://127.0.0.1:27017/LMS
4. Create .env

Create a .env file in the project root.

Example:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/LMS
JWT_SECRET=your_secret_key

Important: Do not upload your real .env file or secret values to GitHub.

5. Start the Backend

For development:

npm run dev

Or:

npm start

The backend will run on:

http://localhost:5000

The API base URL is:

http://localhost:5000/api
🌐 Running the Frontend

After starting the backend, open the frontend using a local development server.

For example, you can use the Live Server extension in Visual Studio Code.

Open:

client/index.html

Then use Open with Live Server.

Make sure the backend server is running before using features that require API communication.

🔌 Main API Areas

The backend provides APIs for the major modules of the application.

Authentication
POST /api/auth/register
POST /api/auth/login
Courses
GET    /api/courses
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
Enrollments
POST /api/enrollments
GET  /api/enrollments/my-courses
Modules
GET    /api/modules
POST   /api/modules
PUT    /api/modules/:id
DELETE /api/modules/:id
Assignments
GET    /api/assignments
POST   /api/assignments
PUT    /api/assignments/:id
DELETE /api/assignments/:id
Submissions
GET  /api/submissions
POST /api/submissions
PUT  /api/submissions/:id
Students
GET /api/students
🧪 API Testing

Backend APIs were tested using Thunder Client.

The following areas were tested:

Registration
Login
Authentication
Course CRUD operations
Enrollment
Module management
Assignment management
Assignment submission
Submission evaluation
Student management
Role-based authorization
📊 Progress Tracking

The system tracks student progress based on completed course modules.

For example:

Total Modules      = 5
Completed Modules  = 3
Course Progress    = 60%

The student can view the progress through the course interface.

🖥️ Screenshots

Screenshots of the completed application can be added below.

Student Interface

Student Registration

Add screenshot here

Student Dashboard

Add screenshot here

Courses

Add screenshot here

My Courses

Add screenshot here

Course Modules

Add screenshot here

Assignments

Add screenshot here

Assignment Submission

Add screenshot here

Student Profile

Add screenshot here

Settings

Add screenshot here
Admin Interface

Admin Dashboard

Add screenshot here

Course Management

Add screenshot here

Module Management

Add screenshot here

Assignment Management

Add screenshot here

Student Management

Add screenshot here

Submission Management

Add screenshot here
⚠️ Current Limitations

This project is developed as an academic/internship major project.

Current limitations include:

The application is primarily designed for local development and demonstration.
File submissions currently use URL/file reference fields rather than complete cloud file storage.
Email notification services are not implemented.
The password change interface is available, but the complete backend password-change functionality requires further implementation.
The application currently uses development/test data.
Advanced LMS features such as live classes, quizzes, certificates, discussion forums, payment integration, and advanced analytics are not included.
🔮 Future Improvements

Possible future improvements include:

Online quizzes
Automatic certificate generation
Email notifications
Cloud file storage
Password reset
Course search and filtering
Student performance analytics
Discussion forums
Course ratings and reviews
Instructor role
Live classes
Advanced admin analytics
Mobile application
📚 Learning Outcomes

Through this project, I gained practical experience in:

Full-stack web development
HTML, CSS and JavaScript
Node.js and Express.js
MongoDB and Mongoose
REST API development
JWT authentication
Password hashing
Role-based authorization
CRUD operations
Frontend-backend integration
Database design
API testing
Git and GitHub
Project documentation
👩‍💻 Developer

Sabiya Sameer Shaikh

MCA Student | Full Stack Development Intern

Location: Pune, Maharashtra, India

GitHub: https://github.com/Sabiya1304

LinkedIn: https://www.linkedin.com/in/sabiya-sameer-shaikh

📄 Project Information
Information	Details
Project	Learning Management System
Project Type	Individual Major Project
Domain	Full Stack Development
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
Database	MongoDB
ODM	Mongoose
Authentication	JWT
Password Security	bcryptjs
API Testing	Thunder Client
Internship	Quillance Infotech Pvt. Ltd.
Year	2026
📜 License

This project was developed for educational and internship purposes.
