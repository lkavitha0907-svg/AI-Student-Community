from database import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(50))
    upvotes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'author': self.author.username if self.author else 'Unknown',
            'subject_id': self.subject_id,
            'subject': self.subject.name if self.subject else '',
            'subject_color': self.subject.color if self.subject else '#6C63FF',
            'subject_icon': self.subject.icon if self.subject else '📚',
            'title': self.title,
            'content': self.content,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'upvotes': self.upvotes,
            'created_at': self.created_at.isoformat(),
        }
