from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.note import Note
from models.subject import Subject
import os, uuid

notes_bp = Blueprint('notes', __name__)

ALLOWED = {'pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED

@notes_bp.route('/', methods=['GET'])
@jwt_required()
def get_notes():
    subject_id = request.args.get('subject_id', type=int)
    query = Note.query
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
    notes = query.order_by(Note.created_at.desc()).all()
    return jsonify({'notes': [n.to_dict() for n in notes]}), 200

@notes_bp.route('/<int:note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    note = Note.query.get_or_404(note_id)
    return jsonify({'note': note.to_dict()}), 200

@notes_bp.route('/', methods=['POST'])
@jwt_required()
def create_note():
    user_id = int(get_jwt_identity())
    data = request.form if request.form else request.get_json()

    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    subject_id = int(data.get('subject_id', 0))

    if not title or not content or not subject_id:
        return jsonify({'error': 'Title, content and subject are required'}), 400

    Subject.query.get_or_404(subject_id)

    file_path = None
    file_type = None
    if 'file' in request.files:
        f = request.files['file']
        if f and f.filename and allowed_file(f.filename):
            ext = f.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            f.save(os.path.join(upload_dir, filename))
            file_path = filename
            file_type = ext

    note = Note(
        user_id=user_id,
        subject_id=subject_id,
        title=title,
        content=content,
        file_path=file_path,
        file_type=file_type
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({'note': note.to_dict(), 'message': 'Note uploaded!'}), 201

@notes_bp.route('/<int:note_id>/upvote', methods=['POST'])
@jwt_required()
def upvote_note(note_id):
    note = Note.query.get_or_404(note_id)
    note.upvotes += 1
    db.session.commit()
    return jsonify({'upvotes': note.upvotes}), 200

@notes_bp.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
