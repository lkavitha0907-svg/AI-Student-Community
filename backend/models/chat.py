from database import db
from datetime import datetime

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    is_global = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.sender.username if self.sender else 'Unknown',
            'avatar_color': self.sender.avatar_color if self.sender else '#6C63FF',
            'level': self.sender.level if self.sender else 1,
            'subject_id': self.subject_id,
            'message': self.message,
            'is_global': self.is_global,
            'created_at': self.created_at.isoformat(),
        }
