from flask import Blueprint, request, jsonify
from model.user_model import UserModel

user_bp = Blueprint('user_bp', __name__)
obj = UserModel()

def get_request_data():
    if request.is_json:
        return request.get_json()
    return request.form.to_dict()



@user_bp.route('/user/register', methods=['POST'])
def user_register_controller():
    payload = get_request_data()
    
    if not payload or 'email' not in payload or 'password' not in payload:
        return jsonify({"error": "Email and password are required to register"}), 400
        
    data, status_code = obj.user_register_model(payload)
    return jsonify(data), status_code


@user_bp.route('/user/login', methods=['POST'])
def user_login_controller():
    payload = get_request_data()
    
    if not payload or 'email' not in payload or 'password' not in payload:
        return jsonify({"error": "Email and password are required to login"}), 400
        
    data, status_code = obj.user_login_model(payload)
    return jsonify(data), status_code



@user_bp.route('/user/getall', methods=['GET'])
def user_getall_controller():
    data, status_code = obj.user_getall_model()
    return jsonify(data), status_code


@user_bp.route('/user/addone', methods=['POST'])
def user_addone_controller():
    payload = get_request_data()
    
    if not payload or 'email' not in payload:
        return jsonify({"error": "Missing required fields"}), 400
        
    data, status_code = obj.user_addone_model(payload)
    return jsonify(data), status_code


@user_bp.route('/user/update', methods=['PUT'])
def user_update_controller():
    payload = get_request_data()
    
    if 'id' not in payload:
        return jsonify({"error": "User ID is required for update operation"}), 400
        
    data, status_code = obj.user_update_model(payload)
    return jsonify(data), status_code


@user_bp.route('/user/delete', methods=['DELETE'])
def user_delete_controller():
    payload = get_request_data()
    
    if 'id' not in payload:
        return jsonify({"error": "User ID is required for deletion operation"}), 400
        
    data, status_code = obj.user_delete_model(payload)
    return jsonify(data), status_code