from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.subject import Subject
from models.chat import ChatMessage

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/', methods=['GET'])
@jwt_required()
def get_subjects():
    subjects = Subject.query.all()
    return jsonify({'subjects': [s.to_dict() for s in subjects]}), 200


# ── Chat ──────────────────────────────────────────────────────────────────────
chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    subject_id = request.args.get('subject_id', type=int)
    limit = request.args.get('limit', 50, type=int)

    query = ChatMessage.query
    if subject_id:
        query = query.filter_by(subject_id=subject_id, is_global=False)
    else:
        query = query.filter_by(is_global=True)

    messages = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return jsonify({'messages': [m.to_dict() for m in reversed(messages)]}), 200

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    message_text = data.get('message', '').strip()
    subject_id = data.get('subject_id')
    is_global = data.get('is_global', True)

    if not message_text:
        return jsonify({'error': 'Message cannot be empty'}), 400

    msg = ChatMessage(
        user_id=user_id,
        subject_id=subject_id,
        message=message_text,
        is_global=is_global
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': msg.to_dict()}), 201