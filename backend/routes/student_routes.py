from flask import Blueprint, jsonify
from database import execute_query
from utils.response import success_response, error_response
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

    student = execute_query(
        "SELECT id, name, email FROM students WHERE id=%s",
        (id,),
        fetchone=True
    )

    if student:
        return success_response(student, "Student fetched successfully")
    else:
        return error_response("Student not found", 404)