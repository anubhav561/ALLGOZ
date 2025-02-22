from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import uuid
from datetime import datetime, timedelta
from functools import wraps
import os
from store import store

auth = Blueprint('auth', __name__)

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)

def compare_password(password, hashed_password):
    """Compare a password with its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

def generate_client_code():
    """Generate a unique client code"""
    return str(len(store.users) + 1).zfill(2)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            current_user = store.users.get(data['userId'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth.route('/signup', methods=['POST'])
def signup():
    try:
        print('Signup request received:', request.json)
        data = request.json
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')

        # Validate required fields
        if not email or not password:
            print('Missing required fields')
            return jsonify({'message': 'Email and password are required'}), 400

        # Check if user already exists
        if any(user['email'] == email for user in store.users.values()):
            print('User already exists:', email)
            return jsonify({'message': 'User already exists'}), 400

        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        client_code = generate_client_code()
        webhook_url = f"https://algoz.tech/webhook/{user_id}/{uuid.uuid4()}"

        # Create new user
        user = {
            'userId': user_id,
            'email': email,
            'password': hashed_password,
            'phone': phone,
            'clientCode': client_code,
            'coins': 0,
            'theme': 'light',
            'webhookUrl': webhook_url,
            'createdAt': datetime.now().isoformat()
        }

        store.users[user_id] = user
        print('New user created:', {'userId': user_id, 'email': email, 'clientCode': client_code})

        # Generate JWT token
        token = jwt.encode(
            {'userId': user_id, 'exp': datetime.utcnow() + timedelta(days=1)},
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )

        response = {
            'token': token,
            'user': {
                'userId': user_id,
                'email': email,
                'clientCode': client_code,
                'coins': 0,
                'theme': 'light'
            }
        }

        print('Sending signup response:', response)
        return jsonify(response), 201

    except Exception as error:
        print('Signup error:', str(error))
        return jsonify({'message': 'Error creating user'}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Find user
        user = next((u for u in store.users.values() if u['email'] == email), None)
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401

        # Verify password
        if not compare_password(password, user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401

        # Generate JWT token
        token = jwt.encode(
            {'userId': user['userId'], 'exp': datetime.utcnow() + timedelta(days=1)},
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )

        return jsonify({
            'token': token,
            'user': {
                'userId': user['userId'],
                'email': user['email'],
                'clientCode': user['clientCode'],
                'coins': user['coins'],
                'theme': user['theme']
            }
        })

    except Exception as error:
        print('Login error:', str(error))
        return jsonify({'message': 'Error logging in'}), 500

@auth.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    try:
        return jsonify({
            'userId': current_user['userId'],
            'email': current_user['email'],
            'clientCode': current_user['clientCode'],
            'coins': current_user['coins'],
            'theme': current_user['theme'],
            'webhookUrl': current_user['webhookUrl']
        })

    except Exception as error:
        print('Profile error:', str(error))
        return jsonify({'message': 'Error fetching profile'}), 500

@auth.route('/theme', methods=['PUT'])
@token_required
def update_theme(current_user):
    try:
        data = request.json
        theme = data.get('theme')
        
        if not theme:
            return jsonify({'message': 'Theme is required'}), 400

        current_user['theme'] = theme
        store.users[current_user['userId']] = current_user

        return jsonify({'theme': current_user['theme']})

    except Exception as error:
        print('Theme update error:', str(error))
        return jsonify({'message': 'Error updating theme'}), 500 