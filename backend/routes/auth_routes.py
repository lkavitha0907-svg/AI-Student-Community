from flask import Blueprint, request, jsonify
from utils.response import success_response, error_response
from database import execute_query

auth = Blueprint("auth", __name__)

# ---------------- REGISTER ----------------
@auth.route("/register", methods=["POST"])
def register():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]

    cursor.execute(
        "INSERT INTO students(name,email,password) VALUES(%s,%s,%s)",
        (name, email, password)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return success_response(
    message="Registered successfully"
)


# ---------------- LOGIN ----------------
@auth.route("/login", methods=["POST"])
def login():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    data = request.json

    cursor.execute(
        "SELECT * FROM students WHERE email=%s AND password=%s",
        (data["email"], data["password"])
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return success_response(
        {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        },
        "Login successful"
    )
    else:
        return error_response("Invalid email or password", 401)