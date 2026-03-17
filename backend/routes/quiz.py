from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.quiz import Quiz, Question
from models.attempt import QuizAttempt
from models.note import Note
from models.user import User
from models.subject import Subject
from services.ai_service import generate_questions_from_text
from datetime import date, datetime

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/', methods=['GET'])
@jwt_required()
def get_quizzes():
    subject_id = request.args.get('subject_id', type=int)
    user_id = int(get_jwt_identity())

    query = Quiz.query.filter_by(is_active=True)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    quizzes = query.order_by(Quiz.created_at.desc()).all()

    result = []
    for q in quizzes:
        q_dict = q.to_dict()
        attempt = QuizAttempt.query.filter_by(user_id=user_id, quiz_id=q.id).first()
        q_dict['already_attempted'] = attempt is not None
        q_dict['attempt'] = attempt.to_dict() if attempt else None
        result.append(q_dict)

    return jsonify({'quizzes': result}), 200

@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    quiz = Quiz.query.get_or_404(quiz_id)

    attempt = QuizAttempt.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()
    if attempt:
        return jsonify({'error': 'Already attempted', 'attempt': attempt.to_dict()}), 403

    return jsonify({'quiz': quiz.to_dict()}), 200

@quiz_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_quiz():
    """Generate quiz from a note using AI — supports text and PDF."""
    data = request.get_json()
    note_id = data.get('note_id')
    num_questions = min(data.get('num_questions', 5), 10)

    note = Note.query.get_or_404(note_id)

    # Create quiz
    quiz = Quiz(
        subject_id=note.subject_id,
        title=f"Quiz: {note.title}",
        generated_from_note_id=note_id,
        quiz_date=date.today(),
        is_active=True
    )
    db.session.add(quiz)
    db.session.flush()

    # Combine text content + PDF/file content
    full_text = note.content or ""
    if note.file_path and note.file_type:
        from services.ai_service import extract_text_from_file
        import os
        file_full_path = os.path.join(
            os.path.dirname(__file__), '..', 'uploads', note.file_path
        )
        file_text = extract_text_from_file(file_full_path, note.file_type)
        if file_text:
            full_text = full_text + "\n" + file_text

    # Generate questions using AI service
    questions_data = generate_questions_from_text(full_text, num_questions)

    for q_data in questions_data:
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data['question_text'],
            option_a=q_data['option_a'],
            option_b=q_data['option_b'],
            option_c=q_data['option_c'],
            option_d=q_data['option_d'],
            correct_answer=q_data['correct_answer'],
            points=q_data['points']
        )
        db.session.add(question)

    db.session.commit()
    return jsonify({'quiz': quiz.to_dict(), 'message': 'Quiz generated successfully!'}), 201

@quiz_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    quiz = Quiz.query.get_or_404(quiz_id)

    existing = QuizAttempt.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()
    if existing:
        return jsonify({'error': 'Already attempted this quiz'}), 403

    data = request.get_json()
    answers = data.get('answers', {})

    score = 0
    for question in quiz.questions:
        user_answer = answers.get(str(question.id))
        if user_answer and user_answer.upper() == question.correct_answer:
            score += question.points

    from flask import current_app
    xp_earned = score + current_app.config.get('XP_PER_QUIZ_COMPLETION', 50)

    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=len(quiz.questions),
        xp_earned=xp_earned
    )
    db.session.add(attempt)
    user.add_xp(xp_earned)
    db.session.commit()

    return jsonify({
        'attempt': attempt.to_dict(),
        'score': score,
        'xp_earned': xp_earned,
        'level': user.level,
        'total_xp': user.total_xp,
    }), 200