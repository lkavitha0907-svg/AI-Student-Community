from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.chat import ChatMessage

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