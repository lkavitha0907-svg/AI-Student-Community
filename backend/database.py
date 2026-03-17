from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        from models.user import User
        from models.subject import Subject
        from models.note import Note
        from models.quiz import Quiz, Question
        from models.attempt import QuizAttempt
        from models.chat import ChatMessage
        db.create_all()
        _seed_subjects()

def _seed_subjects():
    from models.subject import Subject
    if Subject.query.count() == 0:
        subjects = [
            Subject(name='Artificial Intelligence', slug='ai', color='#6C63FF'),
            Subject(name='Machine Learning', slug='ml', color='#FF6B6B'),
            Subject(name='Data Science', slug='ds', color='#4ECDC4'),
            Subject(name='Cloud Computing', slug='cloud', color='#45B7D1'),
            Subject(name='Cyber Security', slug='security', color='#FF6B9D'),
            Subject(name='Web Development', slug='webdev', color='#96CEB4'),
            Subject(name='Database Management', slug='dbms', color='#FFD700'),
            Subject(name='Computer Networks', slug='networks', color='#DDA0DD'),
            Subject(name='Operating Systems', slug='os', color='#F0A500'),
            Subject(name='Software Engineering', slug='se', color='#39FF14'),
        ]
        db.session.bulk_save_objects(subjects)
        db.session.commit()