from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# simple in-memory store for users and logs
users = {}
logs = []

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if username in users:
        return jsonify({'error': 'User already exists'}), 400
    users[username] = {'password': password, 'balance': 0.0, 'log': []}
    logs.append(f"User {username} registered")
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if username not in users or users[username]['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    logs.append(f"User {username} logged in")
    return jsonify({'message': 'Login successful'}), 200

@app.route('/api/wallet', methods=['GET'])
def get_wallet():
    username = request.args.get('username')
    if not username or username not in users:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': users[username]['balance']}), 200

@app.route('/api/wallet/deposit', methods=['POST'])
def deposit():
    data = request.get_json() or {}
    username = data.get('username')
    amount = data.get('amount')
    if not username or username not in users:
        return jsonify({'error': 'User not found'}), 404
    try:
        amt = float(amount)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid amount'}), 400
    users[username]['balance'] += amt
    users[username]['log'].append(f"Deposited {amt}")
    logs.append(f"{username} deposited {amt}")
    return jsonify({'message': 'Deposit successful', 'balance': users[username]['balance']}), 200

@app.route('/api/trade', methods=['POST'])
def trade():
    data = request.get_json() or {}
    username = data.get('username')
    side = data.get('side')  # 'buy' or 'sell'
    amount = data.get('amount')
    if not username or username not in users:
        return jsonify({'error': 'User not found'}), 404
    try:
        amt = float(amount)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid amount'}), 400
    if users[username]['balance'] < amt:
        return jsonify({'error': 'Insufficient balance'}), 400
    users[username]['balance'] -= amt
    users[username]['log'].append(f"Trade executed: {side} {amt}")
    logs.append(f"{username} executed trade: {side} {amt}")
    return jsonify({'message': 'Trade executed', 'balance': users[username]['balance']}), 200

@app.route('/api/status', methods=['GET'])
def status():
    # return number of users and last 50 logs
    return jsonify({'users': len(users), 'logs': logs[-50:]}), 200

# Serve frontend static files
@app.route('/')
def serve_index():
    return send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'frontend'), 'index.html')

@app.route('/<path:ath>')
def serve_static(path):
    return send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'frontend'), path)


if __name__ == '__main__':
    # For local development. On PythonAnywhere, use WSGI file.
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    # For local development. On PythonAnywhere, use WSGI file.
    app.run(debug=True, host='0.0.0.0', port=5000)
