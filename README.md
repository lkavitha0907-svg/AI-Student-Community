# AI-Student-Community
Web-based student community with AI quiz generation

# AI Student Community

AI Student Community is a backend system that allows students to upload study notes and generate quizzes automatically to test their knowledge.

## System Architecture

The project consists of three main modules:

Frontend – User interface for students to upload notes and take quizzes.

Backend – Flask API that handles authentication, note management, and quiz evaluation.

AI Module – Generates quiz questions automatically from uploaded notes.

## Features

- User Registration
- User Login
- Upload Study Notes
- View Uploaded Notes
- Generate Quiz from Notes
- Submit Quiz and Calculate Score

## Technologies Used

- Python
- Flask
- MySQL
- Postman
- Git & GitHub

## Project Structure

AI-Student-Community
│
├── backend
│   ├── app.py
│   ├── database.py
│   ├── routes
│   │   ├── auth_routes.py
│   │   ├── notes_routes.py
│   │   └── quiz_routes.py
│   ├── utils
│   │   └── response.py
│
├── uploads
└── requirements.txt

## How to Run

1. Clone the repository
2. Install dependencies

pip install -r requirements.txt

3. Run the Flask server

python app.py

## API Modules

- Register User
- Login User
- Upload Notes
- Fetch Notes
- Generate Quiz
- Submit Quiz

## Author

Kavitha
