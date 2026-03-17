from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from config import Config
from database import init_db

socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins="*", supports_credentials=True)
    JWTManager(app)
    socketio.init_app(app)

    init_db(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.quiz import quiz_bp
    from routes.notes import notes_bp
    from routes.leaderboard import leaderboard_bp
    from routes.subjects import subjects_bp, chat_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
    app.register_blueprint(subjects_bp, url_prefix='/api/subjects')

    # WebSocket events
    from routes.socket_events import register_socket_events
    register_socket_events(socketio)

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'GameLearn API running 🎮'}

    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
