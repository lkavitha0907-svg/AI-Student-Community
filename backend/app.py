print("THIS IS THE REAL APP FILE")

from flask import Flask, jsonify, request
from database import get_db_connection

app = Flask(__name__)

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "AI Student Community Backend Running "


@app.route("/test")
def test():
    return "TEST WORKING"



# ---------------- DUMMY AI ----------------
def generate_questions(text):
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


# ---------------- STUDENTS ----------------
@app.route("/students")
def students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students")
    data = cursor.fetchall()

    conn.close()
    return jsonify(data)


# ---------------- GET QUIZ ----------------
@app.route("/quiz/<int:note_id>")
def get_quiz(note_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM quizzes WHERE note_id=%s",
        (note_id,)
    )
    data = cursor.fetchall()

    conn.close()
    return jsonify(data)


# ---------------- SUBMIT QUIZ ----------------
@app.route("/submit-quiz", methods=["POST"])
def submit_quiz():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

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

    conn.commit()
    conn.close()

    return {"message": "Quiz submitted ", "score": score}


# ---------------- UPLOAD NOTES ----------------
@app.route("/upload-notes", methods=["POST"])
def upload_notes():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    filename = request.json.get("filename")
    filepath = request.json.get("filepath")
    uploaded_by = request.json.get("uploaded_by")

    sql = """
        INSERT INTO notes (filename, filepath, uploaded_by)
        VALUES (%s, %s, %s)
    """

    cursor.execute(sql, (filename, filepath, uploaded_by))

    conn.commit()
    conn.close()

    return {"message": "Notes uploaded successfully "}


# ---------------- GENERATE QUIZ ----------------
@app.route("/generate-quiz/<int:note_id>")
def generate_quiz(note_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    text = "Sample notes content"
    questions = generate_questions(text)

    for q in questions:
        cursor.execute("""
            INSERT INTO quizzes
            (note_id, question, option_a, option_b,
             option_c, option_d, correct_answer)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (
            note_id,
            q["question"],
            q["a"],
            q["b"],
            q["c"],
            q["d"],
            q["answer"]
        ))

    conn.commit()
    conn.close()

    return {"message": "Quiz generated successfully "}


# ---------------- TEST UPLOAD ----------------
@app.route("/test-upload")
def test_upload():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO notes (filename, filepath, uploaded_by)
        VALUES (%s,%s,%s)
    """, ("ai_notes.pdf", "/uploads/ai_notes.pdf", 1))

    conn.commit()
    conn.close()

    return "Test note inserted successfully "


# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]

    cursor.execute(
        "INSERT INTO students(name,email,password) VALUES(%s,%s,%s)",
        (name,email, password)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Registered successfully"})


@app.route("/hello")
def hello():
    return "Hello working"





# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    data = request.json

    cursor.execute(
        "SELECT * FROM students WHERE email=%s AND password=%s",
        (data["email"], data["password"])
    )

    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({"message": "Login successful", "user":  {
        "id": user[0],
        "name": user[1],
        "email": user[2]
    }})
    else:
        return jsonify({"message": "Invalid email or password"}), 401


print("Available Routes:")
for rule in app.url_map.iter_rules():
    print(rule)

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
