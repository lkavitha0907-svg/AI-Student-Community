from database import db
from datetime import datetime, date

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    generated_from_note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=True)
    quiz_date = db.Column(db.Date, default=date.today)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True)

    def to_dict(self, include_answers=False):
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'subject': self.subject.name if self.subject else '',
            'subject_color': self.subject.color if self.subject else '#6C63FF',
            'subject_icon': self.subject.icon if self.subject else '📚',
            'title': self.title,
            'quiz_date': self.quiz_date.isoformat(),
            'is_active': self.is_active,
            'question_count': len(self.questions),
            'questions': [q.to_dict(include_answer=include_answers) for q in self.questions],
        }

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(500), nullable=False)
    option_b = db.Column(db.String(500), nullable=False)
    option_c = db.Column(db.String(500), nullable=False)
    option_d = db.Column(db.String(500), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    points = db.Column(db.Integer, default=10)

    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'question_text': self.question_text,
            'options': {
                'A': self.option_a,
                'B': self.option_b,
                'C': self.option_c,
                'D': self.option_d,
            },
            'points': self.points,
        }
        if include_answer:
            data['correct_answer'] = self.correct_answer
        return data
