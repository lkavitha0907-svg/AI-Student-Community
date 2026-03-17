# 🎮 GameLearn — AI Student Arena

> A game-themed AI-powered student community platform with real-time chat, automated quiz generation, notes sharing, and a live leaderboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Quiz Generation** | Uploads notes → AI reads → generates unique questions per student |
| ⚡ **Quiz Arena** | One attempt per quiz per day, timed, real-time scoring |
| 💬 **Real-time Chat** | Discord-style chat per subject + global channel via WebSockets |
| 📚 **Knowledge Base** | Upload & browse notes by subject, upvote best content |
| 🏆 **Live Leaderboard** | Real-time XP/score rankings with animated podium |
| 🎮 **Game Theme** | Dark neon UI, XP system, levels, avatar customization |

---

## 🗂️ Project Structure

```
gamelearn/
├── backend/                  ← Flask Python API
│   ├── app.py                ← Main Flask app + SocketIO
│   ├── config.py             ← Configuration
│   ├── database.py           ← SQLAlchemy init + seeding
│   ├── requirements.txt
│   ├── .env.example          ← Copy to .env
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── note.py
│   │   ├── quiz.py
│   │   ├── attempt.py
│   │   └── chat.py
│   ├── routes/
│   │   ├── auth.py           ← Register/Login/JWT
│   │   ├── quiz.py           ← Quiz CRUD + submit
│   │   ├── notes.py          ← Upload/browse notes
│   │   ├── chat.py           ← Chat history
│   │   ├── leaderboard.py    ← Rankings
│   │   ├── subjects.py       ← Subject list
│   │   └── socket_events.py  ← WebSocket handlers
│   └── services/
│       └── ai_service.py     ← AI quiz generation (mock → real)
├── frontend/                 ← React app
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.js            ← Router + auth guard
│       ├── index.css         ← Game theme CSS
│       ├── components/
│       │   └── Sidebar.jsx
│       ├── hooks/
│       │   ├── useAuth.js    ← Auth context
│       │   └── useToast.js   ← Toast notifications
│       ├── pages/
│       │   ├── AuthPage.jsx        ← Login/Register
│       │   ├── Dashboard.jsx       ← Home overview
│       │   ├── QuizPage.jsx        ← Quiz list + player
│       │   ├── NotesPage.jsx       ← Notes + upload
│       │   ├── ChatPage.jsx        ← Real-time chat
│       │   ├── LeaderboardPage.jsx ← Rankings
│       │   └── ProfilePage.jsx     ← User profile
│       └── utils/
│           └── api.js        ← Axios instance
└── database/
    └── schema.sql            ← Raw MySQL schema (optional)
```

---

## 🚀 Setup Instructions

### Step 1 — Database

```sql
-- In MySQL, run:
CREATE DATABASE gamelearn;
```
The app auto-creates tables on first run via SQLAlchemy.

---

### Step 2 — Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with your MySQL password and secret keys

# 4. Run the server
python app.py
# → Running on http://localhost:5000
```

---

### Step 3 — Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm start
# → Opens http://localhost:3000
```

---

### Step 4 — For Your Team on GitHub

**Each teammate:**
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/gamelearn.git
cd gamelearn

# Backend setup (above)
# Frontend setup (above)

# Pull latest changes
git pull origin main
```

**Branch strategy for your team:**
```bash
# You (backend)
git checkout -b feature/backend-improvements

# Frontend friend
git checkout -b feature/frontend-updates

# AI friend
git checkout -b feature/ai-module

# Merge via Pull Requests on GitHub
```

---

## 🤖 Connecting Real AI (When Your Friend Is Ready)

Open `backend/services/ai_service.py` and replace the `generate_questions_from_text()` function:

**For OpenAI:**
```python
import openai

def generate_questions_from_text(text, num_questions=5, user_seed=None):
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"""
                Generate {num_questions} multiple choice questions from the notes.
                Return a JSON array. Each item must have:
                question_text, option_a, option_b, option_c, option_d, correct_answer (A/B/C/D), points (10)
                Make questions unique using seed: {user_seed}
            """},
            {"role": "user", "content": text}
        ]
    )
    import json
    return json.loads(response.choices[0].message.content)
```

**For Gemini:**
```python
import google.generativeai as genai

def generate_questions_from_text(text, num_questions=5, user_seed=None):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(f"Generate {num_questions} MCQ questions from: {text}")
    # Parse response...
```

Add your API key to `.env`:
```
OPENAI_API_KEY=sk-...
```

---

## 🌐 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/subjects/` | List all subjects |
| GET | `/api/notes/` | List notes (filter by subject) |
| POST | `/api/notes/` | Upload a note |
| GET | `/api/quiz/` | List quizzes |
| GET | `/api/quiz/:id` | Get quiz (if not attempted) |
| POST | `/api/quiz/generate` | AI-generate quiz from note |
| POST | `/api/quiz/:id/submit` | Submit answers |
| GET | `/api/leaderboard/` | Get rankings |
| GET | `/api/chat/history` | Get chat history |
| WS | `socket.io` | Real-time chat |

---

## 🎮 Game Mechanics

- **XP per correct answer:** 20 XP
- **XP per quiz completion:** 50 XP  
- **Level formula:** Level = (total_xp ÷ 200) + 1
- **One attempt** per quiz per day (enforced at DB level)
- **Leaderboard** ranks by total score, refreshes every 15s

---

## 👥 Team Workflow

| Person | Responsibility | Branch |
|---|---|---|
| You | Backend (Flask + DB) | `main` / `feature/backend-*` |
| Friend 1 | Frontend (React) | `feature/frontend-*` |
| Friend 2 | AI Module | `feature/ai-module` |

When your AI friend finishes — just update `backend/services/ai_service.py` with the real implementation. Everything else stays the same!
