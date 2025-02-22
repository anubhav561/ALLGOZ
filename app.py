from flask import Flask, send_from_directory, redirect, request, jsonify, render_template
from flask_cors import CORS
import os
import bcrypt
import uuid
from datetime import datetime
from dotenv import load_dotenv
from store import store
from routes.auth import auth
from routes.coins import coins

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure static files
app.static_folder = 'public'
app.static_url_path = ''

# Register blueprints
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(coins, url_prefix='/api/coins')

# Default route - redirect to login
@app.route('/')
def index():
    return redirect('/login.html')

# HTML routes without .html extension
@app.route('/login')
@app.route('/login.html')
def login():
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/signup')
@app.route('/signup.html')
def signup():
    return send_from_directory(app.static_folder, 'signup.html')

@app.route('/dashboard')
@app.route('/dashboard.html')
def dashboard():
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/broker-auth')
@app.route('/broker-auth.html')
def broker_auth():
    return send_from_directory(app.static_folder, 'broker-auth.html')

# Serve static files
@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(app.static_folder, filename)
    except Exception as e:
        print(f"Error serving static file {filename}: {str(e)}")
        return jsonify(error=f"File not found: {filename}"), 404

# Error handler for 404
@app.errorhandler(404)
def not_found(e):
    print(f"404 error: {request.path}")
    if '.html' in request.path:
        try:
            return send_from_directory(app.static_folder, request.path.lstrip('/'))
        except:
            pass
    return jsonify(error=str(e)), 404

# Create test user
def create_test_user():
    user_id = str(uuid.uuid4())
    hashed_password = bcrypt.hashpw('test123'.encode('utf-8'), bcrypt.gensalt())
    user = {
        'userId': user_id,
        'email': 'test@example.com',
        'password': hashed_password,
        'clientCode': '01',
        'coins': 100,
        'theme': 'light',
        'webhookUrl': f"https://algoz.tech/webhook/{user_id}/{uuid.uuid4()}",
        'createdAt': datetime.now().isoformat()
    }
    store.users[user_id] = user
    print('Test user created:', user['email'])

if __name__ == '__main__':
    # Create test user before starting the server
    create_test_user()
    
    # Start the server
    port = int(os.getenv('PORT', 3000))
    print(f'Server is running on port {port}')
    print(f'Visit http://localhost:{port} to access the application')
    
    # Enable debug mode and start server
    app.debug = True
    app.run(host='0.0.0.0', port=port) 