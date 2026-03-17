from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
from database import db
from models.chat import ChatMessage
from models.user import User

def register_socket_events(socketio):

    @socketio.on('connect')
    def on_connect(auth):
        print(f'Client connected')

    @socketio.on('disconnect')
    def on_disconnect():
        print('Client disconnected')

    @socketio.on('join')
    def on_join(data):
        room = data.get('room', 'global')
        join_room(room)
        emit('system', {'message': f'Joined {room}'}, room=room)

    @socketio.on('leave')
    def on_leave(data):
        room = data.get('room', 'global')
        leave_room(room)

    @socketio.on('message')
    def on_message(data):
        token = data.get('token')
        message_text = data.get('message', '').strip()
        room = data.get('room', 'global')
        subject_id = data.get('subject_id')

        if not message_text or not token:
            return

        try:
            decoded = decode_token(token)
            user_id = int(decoded['sub'])
            user = User.query.get(user_id)
            if not user:
                return

            msg = ChatMessage(
                user_id=user_id,
                subject_id=subject_id,
                message=message_text,
                is_global=(room == 'global')
            )
            db.session.add(msg)
            db.session.commit()

            emit('message', msg.to_dict(), room=room)

        except Exception as e:
            print(f'Socket error: {e}')
