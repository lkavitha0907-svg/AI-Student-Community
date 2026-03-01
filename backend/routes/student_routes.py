from flask import Blueprint, jsonify
from database import get_db_connection

students_bp = Blueprint("students", __name__)

# ---------------- GET ALL STUDENTS ----------------
@students_bp.route("/students", methods=["GET"])
def students():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


# ---------------- GET SINGLE STUDENT ----------------
@students_bp.route("/student/<int:id>", methods=["GET"])
def get_student(id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, email FROM students WHERE id=%s",
        (id,)
    )

    student = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify(student)