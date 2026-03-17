from database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar_color = db.Column(db.String(20), default='#6C63FF')
    level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    notes = db.relationship('Note', backref='author', lazy=True)
    attempts = db.relationship('QuizAttempt', backref='student', lazy=True)
    messages = db.relationship('ChatMessage', backref='sender', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def add_xp(self, amount):
        self.total_xp += amount
        self.level = max(1, self.total_xp // 200 + 1)

    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'username': self.username,
            'avatar_color': self.avatar_color,
            'level': self.level,
            'total_xp': self.total_xp,
            'created_at': self.created_at.isoformat(),
        }
        if include_private:
            data['email'] = self.email
        return data
