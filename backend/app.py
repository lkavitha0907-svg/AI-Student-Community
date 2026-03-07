print("THIS IS THE REAL APP FILE")

from flask import Flask, jsonify, request
from flask_cors import CORS
# ---------------- CREATE APP ----------------
app = Flask(__name__)
CORS(app)
# ---------------- IMPORT ROUTES ----------------
from routes.auth_routes import auth
from routes.student_routes import students_bp
from routes.notes_routes import notes_bp
from routes.quiz_routes import quiz_bp
# ---------------- REGISTER BLUEPRINTS ----------------
app.register_blueprint(auth)
app.register_blueprint(students_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(quiz_bp)
# ---------------- BASIC ROUTES  ----------------
@app.route("/")
def home():
    return "AI Student Community Backend Running "


@app.route("/test")
def test():
    return "TEST WORKING"
# ---------------- RUN SERVER ----------------
if __name__ == "__main__":

    print("\nAvailable Routes:")
    for rule in app.url_map.iter_rules():
        print(rule)

    app.run(debug=True, port=5000)
