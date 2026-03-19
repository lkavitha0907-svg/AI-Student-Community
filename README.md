# 🎮 GameLearn — AI Student Community Platform

<div align="center">

![GameLearn Banner](https://img.shields.io/badge/GameLearn-AI%20Student%20Arena-6C63FF?style=for-the-badge&logo=game&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-9.6-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)

**A game-themed AI-powered student community where learning meets competition.**

[🎮 Features](#-features) · [🛠️ Tech Stack](#️-tech-stack) · [🚀 Setup](#-setup--installation) · [📡 API](#-api-endpoints) · [👥 Team](#-team)

</div>

---

## 🎯 What is GameLearn?

GameLearn is a full-stack web application that transforms studying into a competitive and engaging experience. Students upload their study notes, an AI reads them and automatically generates quiz questions, and students compete on a live leaderboard to earn XP, level up, and climb the rankings.

> 🤖 **AI reads your notes → generates quizzes → you compete → leaderboard updates live**

---

## 🎬 Demo Video

> 📹 **Demo video coming soon!**
>
> <!-- Add your demo video link here when ready -->
> <!-- [![Watch Demo](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](YOUR_VIDEO_LINK) -->

---

## ✨ Features

### 📚 Notes System
- Upload study notes as **Text, PDF, TXT, or DOCX** files
- Notes organized by subject (AI, ML, Cyber Security, DBMS, and more)
- Browse and **read notes** from all students
- **Upvote** helpful notes from other students
- Delete your own notes
- AI reads uploaded PDFs to generate quiz questions

### 🤖 AI Quiz Generation
- AI automatically reads note content and generates **10 unique MCQ questions**
- Uses **Google Gemini AI** (free tier) for intelligent question generation
- Falls back to smart mock AI when no API key is set
- Each student gets **different question order** using user-based seeding
- Questions are based on actual note content — no generic filler questions

### ⚡ Quiz Arena
- **Timed quizzes** with countdown timer
- **One attempt per quiz** — enforced at database level
- **One quiz per subject per day** — shown and blocked before attempting
- After submitting — **detailed answer review** showing:
  - ✅ Correct answers highlighted in green
  - ❌ Wrong answers highlighted in red
  - The correct answer shown for every wrong question

### 🏆 Live Leaderboard
- **Real-time rankings** updated every 15 seconds
- Animated **top 3 podium** with gold, silver, bronze
- Your own rank is always highlighted
- Shows score, level, XP, and quizzes taken

### 🎮 XP and Level System
- **10 XP** per correct answer + **50 XP** completion bonus
- **Progressive level system:**

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Rookie | 0 XP |
| 2 | Learner | 300 XP |
| 3 | Student | 800 XP |
| 4 | Scholar | 1,500 XP |
| 5 | Expert | 2,500 XP |
| 6 | Master | 4,000 XP |
| 7 | Champion | 6,000 XP |
| 8 | Legend | 8,500 XP |
| 9 | Elite | 11,500 XP |
| 10 | Grandmaster | 15,000 XP |

- 🎊 **Confetti celebration** and animated modal when leveling up

### 💬 Real-time Chat
- **General channel** for all students
- **Subject-specific channels** for focused discussions
- Messages refresh every 3 seconds automatically

### 👤 Player Profile
- Customizable **avatar color** from 10 options
- Personal stats — score, XP, quizzes taken, notes uploaded
- Full **quiz history** with scores and XP earned

### 📜 Rules Page
- Complete game rules and guidelines
- XP progression table
- Dos and Don'ts for all features

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Backend programming language |
| Flask | 3.0.0 | Web framework and API routing |
| Flask-SQLAlchemy | 3.1.1 | Database ORM |
| Flask-JWT-Extended | 4.6.0 | Authentication tokens |
| Flask-SocketIO | 5.3.6 | Real-time WebSocket chat |
| Flask-CORS | 4.0.0 | Cross-origin request handling |
| PyMySQL | 1.1.0 | MySQL database driver |
| Werkzeug | 3.0.1 | Password hashing |
| python-dotenv | 1.0.0 | Environment variable management |
| PyPDF2 | 3.0.1 | PDF text extraction |
| python-docx | 1.1.0 | DOCX text extraction |
| google-generativeai | latest | Gemini AI quiz generation |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| React Router | 6.22.0 | Client-side routing |
| Axios | 1.6.7 | HTTP requests with JWT |
| Socket.IO Client | 4.7.4 | Real-time communication |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0+ | Primary relational database |

---

## 🗄️ Database Structure

```
gamelearn/
├── users           — Student accounts, XP, levels, avatars
├── subjects        — 10 computer science subjects
├── notes           — Uploaded study notes with file support
├── quizzes         — AI-generated quizzes per note
├── questions       — MCQ questions (A/B/C/D) per quiz
├── quiz_attempts   — Student attempts (one per quiz enforced)
└── chat_messages   — Chat history per channel
```

---

## 🚀 Setup & Installation

### Prerequisites
Install these on your computer first:
- [Python 3.10+](https://python.org) — check **"Add to PATH"** during install
- [Node.js 18+ LTS](https://nodejs.org) — check **"Add to PATH"** during install
- [MySQL 8.0+](https://mysql.com)
- [Git](https://git-scm.com)

> ⚠️ After installing, **restart your computer once** before continuing.

### Step 1 — Clone the Repository
```bash
git clone https://github.com/lkavitha0907-svg/AI-Student-Community.git
cd AI-Student-Community
```

### Step 2 — Create Database
Open MySQL Workbench and run:
```sql
CREATE DATABASE gamelearn;
```

### Step 3 — Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
pip install PyPDF2 python-docx google-generativeai

# Create environment file
copy .env.example .env
```

Edit `.env` with your MySQL password:
```env
SECRET_KEY=any-random-secret-key
JWT_SECRET_KEY=another-random-secret
DEBUG=True
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DB=gamelearn

# Optional: Add Gemini API key for real AI (free at aistudio.google.com)
# GEMINI_API_KEY=your_key_here
```

> ⚠️ No quotes around values. Write `MYSQL_PASSWORD=abc123` not `MYSQL_PASSWORD="abc123"`

```bash
# Start backend server
python app.py
# Runs on http://localhost:5000
```

### Step 4 — Frontend Setup
Open a **new terminal window**:
```bash
cd frontend
npm install       # Only needed once
npm start         # Opens http://localhost:3000
```

### Step 5 — Done! 🎉
Visit **http://localhost:3000**, register an account and start playing!

---

## 🔄 Daily Run Commands

Open **two terminal windows** every time:

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate
python app.py

# Terminal 2 — Frontend
cd frontend
npm start
```

---

## 🔧 Common Issues & Fixes

| Error | Fix |
|---|---|
| `npm is not recognized` | Run: `[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Program Files\nodejs", "User")` then reopen terminal |
| `scripts is disabled` | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `Access denied for root@localhost` | Check MySQL password in `.env` — no quotes, no spaces |
| `ModuleNotFoundError: flask` | Run `venv\Scripts\activate` first |
| `Proxy error: ECONNREFUSED` | Backend is not running — start it in a separate terminal |
| Tables not found | Make sure `CREATE DATABASE gamelearn;` was run in MySQL |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT token |
| GET | `/api/auth/me` | ✅ | Get current user info |
| PUT | `/api/auth/profile` | ✅ | Update avatar color |

### Notes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notes/` | ✅ | List all notes (filter by subject) |
| POST | `/api/notes/` | ✅ | Upload a note with optional file |
| DELETE | `/api/notes/:id` | ✅ | Delete your own note |
| POST | `/api/notes/:id/upvote` | ✅ | Upvote a note |

### Quiz
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quiz/` | ✅ | List quizzes with attempt status |
| GET | `/api/quiz/:id` | ✅ | Get quiz (blocked if already attempted) |
| POST | `/api/quiz/generate` | ✅ | AI-generate 10 questions from note |
| POST | `/api/quiz/:id/submit` | ✅ | Submit answers, returns full breakdown |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subjects/` | ✅ | List all 10 subjects |
| GET | `/api/leaderboard/` | ✅ | Top 50 players by score |
| GET | `/api/chat/history` | ✅ | Chat messages (filter by subject) |
| POST | `/api/chat/send` | ✅ | Send a chat message |
| GET | `/api/health` | ❌ | Check if backend is running |

---

## 📁 Project Structure

```
AI-Student-Community/
├── backend/
│   ├── app.py                  ← Flask app entry point
│   ├── config.py               ← All configuration settings
│   ├── database.py             ← DB init + subject seeding
│   ├── requirements.txt        ← Python dependencies
│   ├── .env.example            ← Environment file template
│   ├── models/
│   │   ├── user.py             ← User + XP/level system
│   │   ├── subject.py          ← Subject model
│   │   ├── note.py             ← Note model
│   │   ├── quiz.py             ← Quiz + Question models
│   │   ├── attempt.py          ← Quiz attempt model
│   │   └── chat.py             ← Chat message model
│   ├── routes/
│   │   ├── auth.py             ← Auth endpoints
│   │   ├── quiz.py             ← Quiz endpoints
│   │   ├── notes.py            ← Notes endpoints
│   │   ├── subjects.py         ← Subjects + chat endpoints
│   │   ├── leaderboard.py      ← Rankings endpoint
│   │   └── socket_events.py    ← WebSocket handlers
│   └── services/
│       └── ai_service.py       ← Gemini AI + mock AI
├── frontend/
│   └── src/
│       ├── App.js              ← Router + auth guard
│       ├── index.css           ← Dark neon game theme
│       ├── components/
│       │   └── Sidebar.jsx     ← Navigation + XP bar
│       ├── hooks/
│       │   ├── useAuth.js      ← Auth context
│       │   └── useToast.js     ← Notifications
│       ├── pages/
│       │   ├── AuthPage.jsx        ← Login/Register
│       │   ├── Dashboard.jsx       ← Home overview
│       │   ├── QuizPage.jsx        ← Quiz list + player
│       │   ├── NotesPage.jsx       ← Notes management
│       │   ├── ChatPage.jsx        ← Real-time chat
│       │   ├── LeaderboardPage.jsx ← Rankings + podium
│       │   ├── ProfilePage.jsx     ← Player profile
│       │   └── RulesPage.jsx       ← Game rules
│       └── utils/
│           └── api.js          ← Axios with JWT
└── database/
    └── schema.sql              ← Raw MySQL schema
```

---

## 📚 Available Subjects

| Icon | Subject |
|------|---------|
| 🤖 | Artificial Intelligence |
| 🧠 | Machine Learning |
| 📊 | Data Science |
| ☁️ | Cloud Computing |
| 🔒 | Cyber Security |
| 🌐 | Web Development |
| 🗄️ | Database Management |
| 🔗 | Computer Networks |
| ⚙️ | Operating Systems |
| 💻 | Software Engineering |

---

## 🔮 Future Improvements

- [ ] Real-time WebSocket chat (upgrade from polling)
- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Mobile responsive design
- [ ] Admin dashboard for content moderation
- [ ] Quiz scheduling by teachers
- [ ] Student study groups
- [ ] Note comments and discussions

---

## 👥 Team

| Member | Role | Responsibilities |
|--------|------|-----------------|
| **Kavitha L** | Backend Developer & Team Lead | Flask API, MySQL Database, System Integration, Deployment |
| **Ashwini Gokul G** | Frontend Developer | React UI, Game Theme Design, All Pages & Components |
| **Janani** | AI Module Developer | Quiz Generation Algorithm, Gemini AI Integration, NLP |

> 💡 Add GitHub profile links here when available:
> <!-- [@kavitha](https://github.com/USERNAME) -->
> <!-- [@ashwini](https://github.com/USERNAME) -->
> <!-- [@janani](https://github.com/USERNAME) -->

---

<div align="center">

**🎮 GameLearn — Where Studying Becomes a Game**

Made with ❤️ by Team GameLearn

![Status](https://img.shields.io/badge/Status-Active-39FF14?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-6C63FF?style=flat-square)

</div>
