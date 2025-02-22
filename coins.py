from flask import Blueprint, request, jsonify
import jwt
import uuid
from datetime import datetime
import os
from store import store
from routes.auth import token_required

coins = Blueprint('coins', __name__)

@coins.route('/packages', methods=['GET'])
def get_packages():
    try:
        packages = [
            {
                'id': 1,
                'name': '100 Z Coins',
                'coins': 100,
                'price': 999,
                'description': 'Basic package for starters'
            },
            {
                'id': 2,
                'name': '500 Z Coins',
                'coins': 500,
                'price': 4499,
                'description': 'Most popular package'
            },
            {
                'id': 3,
                'name': '1000 Z Coins',
                'coins': 1000,
                'price': 7999,
                'description': 'Best value package'
            }
        ]
        return jsonify(packages)
    except Exception as error:
        print('Get packages error:', str(error))
        return jsonify({'message': 'Error fetching packages'}), 500

@coins.route('/purchase', methods=['POST'])
@token_required
def purchase_coins(current_user):
    try:
        data = request.json
        package_id = data.get('packageId')
        
        if not package_id:
            return jsonify({'message': 'Package ID is required'}), 400

        # Find package
        packages = get_packages().json
        package = next((p for p in packages if p['id'] == package_id), None)
        
        if not package:
            return jsonify({'message': 'Package not found'}), 404

        # Update user coins
        current_user['coins'] += package['coins']
        store.users[current_user['userId']] = current_user

        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction = {
            'id': transaction_id,
            'userId': current_user['userId'],
            'packageId': package_id,
            'coins': package['coins'],
            'amount': package['price'],
            'status': 'completed',
            'createdAt': datetime.now().isoformat()
        }

        # Store transaction
        if current_user['userId'] not in store.transactions:
            store.transactions[current_user['userId']] = {}
        store.transactions[current_user['userId']][transaction_id] = transaction

        return jsonify({
            'transactionId': transaction_id,
            'coins': current_user['coins'],
            'status': transaction['status']
        })

    except Exception as error:
        print('Purchase error:', str(error))
        return jsonify({'message': 'Error processing purchase'}), 500

@coins.route('/transaction/<transaction_id>', methods=['GET'])
@token_required
def get_transaction_status(current_user, transaction_id):
    try:
        user_transactions = store.transactions.get(current_user['userId'], {})
        transaction = user_transactions.get(transaction_id)
        
        if not transaction:
            return jsonify({'message': 'Transaction not found'}), 404

        return jsonify(transaction)

    except Exception as error:
        print('Get transaction status error:', str(error))
        return jsonify({'message': 'Error fetching transaction status'}), 500

@coins.route('/history', methods=['GET'])
@token_required
def get_transaction_history(current_user):
    try:
        user_transactions = store.transactions.get(current_user['userId'], {})
        transactions = list(user_transactions.values())
        transactions.sort(key=lambda x: x['createdAt'], reverse=True)
        return jsonify(transactions)

    except Exception as error:
        print('Get transaction history error:', str(error))
        return jsonify({'message': 'Error fetching transaction history'}), 500 