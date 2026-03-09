from flask import Blueprint, request, jsonify
from database import get_db_connection
from utils.response import success_response, error_response

quiz_bp = Blueprint("quiz", __name__)


# ---------------- GET QUIZ ----------------
@quiz_bp.route("/quiz/<int:note_id>", methods=["GET"])
def get_quiz(note_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM quizzes WHERE note_id=%s",
        (note_id,)
    )

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return success_response(data, "Quiz fetched successfully")


# ---------------- SUBMIT QUIZ ----------------
@quiz_bp.route("/submit-quiz", methods=["POST"])
def submit_quiz():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    data = request.get_json()

    user_id = data.get("user_id")
    answers = data.get("answers")

    if not answers:
        return error_response("Answers are required")

    score = 0

    for ans in answers:
        quiz_id = ans["quiz_id"]
        selected = ans["selected_answer"]

        cursor.execute(
            "SELECT correct_answer FROM quizzes WHERE id=%s",
            (quiz_id,)
        )

        result = cursor.fetchone()

        if not result:
            continue

        correct = result["correct_answer"]

        is_correct = selected == correct

        if is_correct:
            score += 1

        cursor.execute("""
            INSERT INTO scores
            (user_id, quiz_id, selected_answer, is_correct)
            VALUES (%s,%s,%s,%s)
        """, (user_id, quiz_id, selected, is_correct))

    conn.commit()

    cursor.close()
    conn.close()

    return success_response(
        {"score": score},
        "Quiz submitted successfully"
    )
#------------------GENERATE QUIZ QUESTIONS-----------------
@quiz_bp.route("/generate-quiz/<int:note_id>", methods=["GET"])
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

    cursor.close()
    conn.close()

    return {"message": "Quiz generated successfully"}