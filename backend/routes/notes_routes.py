from flask import Blueprint, request, jsonify
from utils.response import success_response, error_response
from database import get_db_connection

notes_bp = Blueprint("notes", __name__)

# ---------------- UPLOAD NOTES ----------------
@notes_bp.route("/upload-notes", methods=["POST"])
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
    cursor.close()
    conn.close()

    return success_response(message="Notes uploaded successfully")

# ---------------- GET NOTES ----------------
@notes_bp.route("/notes", methods=["GET"])
def get_notes():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM notes")
    notes = cursor.fetchall()

    cursor.close()
    conn.close()

    return success_response(notes, "Notes fetched successfully")


# ---------------- TEST UPLOAD ----------------
@notes_bp.route("/test-upload", methods=["GET"])
def test_upload():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO notes (filename, filepath, uploaded_by)
        VALUES (%s,%s,%s)
    """, ("ai_notes.pdf", "/uploads/ai_notes.pdf", 1))

    conn.commit()
    cursor.close()
    conn.close()

    return "Test note inserted successfully"