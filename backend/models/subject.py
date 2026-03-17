from database import db
from datetime import datetime

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(50), default='📚')
    color = db.Column(db.String(20), default='#6C63FF')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    notes = db.relationship('Note', backref='subject', lazy=True)
    quizzes = db.relationship('Quiz', backref='subject', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'color': self.color,
            'note_count': len(self.notes),
            'quiz_count': len(self.quizzes),
        }
