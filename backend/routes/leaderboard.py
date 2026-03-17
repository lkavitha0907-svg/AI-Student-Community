from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.attempt import QuizAttempt
from sqlalchemy import func

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/', methods=['GET'])
@jwt_required()
def get_leaderboard():
    results = db.session.query(
        User.id,
        User.username,
        User.avatar_color,
        User.level,
        User.total_xp,
        func.coalesce(func.sum(QuizAttempt.score), 0).label('total_score'),
        func.count(QuizAttempt.id).label('quizzes_taken')
    ).outerjoin(QuizAttempt, User.id == QuizAttempt.user_id)\
     .group_by(User.id)\
     .order_by(func.coalesce(func.sum(QuizAttempt.score), 0).desc())\
     .limit(50).all()

    leaderboard = []
    for rank, row in enumerate(results, 1):
        leaderboard.append({
            'rank': rank,
            'user_id': row.id,
            'username': row.username,
            'avatar_color': row.avatar_color,
            'level': row.level,
            'total_xp': row.total_xp,
            'total_score': int(row.total_score),
            'quizzes_taken': row.quizzes_taken,
        })

    return jsonify({'leaderboard': leaderboard}), 200
