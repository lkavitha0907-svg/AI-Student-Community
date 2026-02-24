from flask import request

from flask import Flask, jsonify, request

import mysql.connector

app = Flask(__name__)

# DATABASE CONNECTION
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Root@7024",
    database="student_community"
)

cursor = db.cursor(dictionary=True)

@app.route("/")
def home():
    return "AI Student Community Backend Running 🚀"
def generate_questions(text):

    # Temporary AI (dummy questions)
    questions = [
        {
            "question": "What is AI?",
            "a": "Artificial Intelligence",
            "b": "Automatic Internet",
            "c": "Advanced Input",
            "d": "None",
            "answer": "A"
        },
        {
            "question": "AI is used for?",
            "a": "Gaming only",
            "b": "Smart decision making",
            "c": "Typing",
            "d": "Nothing",
            "answer": "B"
        }
    ]

    return questions



@app.route("/students")
def students():
    cursor.execute("SELECT * FROM students")
    data = cursor.fetchall()
    return jsonify(data)

@app.route("/quiz/<int:note_id>")
def get_quiz(note_id):

    cursor.execute(
        "SELECT * FROM quizzes WHERE note_id=%s",
        (note_id,)
    )

    data = cursor.fetchall()
    return jsonify(data)

@app.route("/submit-quiz", methods=["POST"])
def submit_quiz():

    user_id = request.json.get("user_id")
    answers = request.json.get("answers")

    score = 0

    for ans in answers:

        quiz_id = ans["quiz_id"]
        selected = ans["selected_answer"]

        cursor.execute(
            "SELECT correct_answer FROM quizzes WHERE id=%s",
            (quiz_id,)
        )

        correct = cursor.fetchone()["correct_answer"]

        is_correct = selected == correct

        if is_correct:
            score += 1

        cursor.execute("""
            INSERT INTO scores
            (user_id, quiz_id, selected_answer, is_correct)
            VALUES (%s,%s,%s,%s)
        """, (user_id, quiz_id, selected, is_correct))

    db.commit()

    return {"message": "Quiz submitted ✅", "score": score}


@app.route("/upload-notes", methods=["POST"])
def upload_notes():

    filename = request.json.get("filename")
    filepath = request.json.get("filepath")
    uploaded_by = request.json.get("uploaded_by")

    sql = """
        INSERT INTO notes (filename, filepath, uploaded_by)
        VALUES (%s, %s, %s)
    """

    cursor.execute(sql, (filename, filepath, uploaded_by))
    db.commit()

    return {"message": "Notes uploaded successfully ✅"}

@app.route("/generate-quiz/<int:note_id>")
def generate_quiz(note_id):

    # pretend we read note text
    text = "Sample notes content"

    questions = generate_questions(text)

    for q in questions:
        sql = """
        INSERT INTO quizzes
        (note_id, question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(sql, (
            note_id,
            q["question"],
            q["a"],
            q["b"],
            q["c"],
            q["d"],
            q["answer"]
        ))

    db.commit()

    return {"message": "Quiz generated successfully ✅"}


@app.route("/test-upload")
def test_upload():

    sql = """
        INSERT INTO notes (filename, filepath, uploaded_by)
        VALUES (%s, %s, %s)
    """

    cursor.execute(sql, ("ai_notes.pdf", "/uploads/ai_notes.pdf", 1))
    db.commit()

    return "Test note inserted successfully ✅"

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data["name"]
    email = data["email"]
    password = data["password"]
    role = data["role"]

    query = """
    INSERT INTO users (name, email, password, role)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(query, (name, email, password, role))
    db.commit()

    return jsonify({"message": "User registered successfully"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data["email"]
    password = data["password"]

    query = "SELECT * FROM users WHERE email=%s AND password=%s"
    cursor.execute(query, (email, password))

    user = cursor.fetchone()

    if user:
        return jsonify({
            "message": "Login successful",
            "user": user
        })
    else:
        return jsonify({
            "message": "Invalid email or password"
        }), 401
    
    




if __name__ == "__main__":
    app.run(debug=True, port=5000)
