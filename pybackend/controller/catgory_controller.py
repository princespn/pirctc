from flask import Blueprint, request, jsonify
from model.category_model import CategoryModel

category_bp = Blueprint("category_bp", __name__)
category_model = CategoryModel()


# 1. GET ALL CATEGORIES
@category_bp.route("/api/categories", methods=["GET"])
def get_all_categories():
    result, status_code = category_model.category_getall_model()
    return jsonify(result), status_code


# 2. ADD CATEGORY
@category_bp.route("/api/categories", methods=["POST"])
def add_category():
    payload = request.get_json() or {}
    result, status_code = category_model.category_addone_model(payload)
    return jsonify(result), status_code


# 3. UPDATE CATEGORY
@category_bp.route("/api/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    payload = request.get_json() or {}
    payload["id"] = category_id
    result, status_code = category_model.category_update_model(payload)
    return jsonify(result), status_code


# 4. DELETE CATEGORY
@category_bp.route("/api/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    payload = {"id": category_id}
    result, status_code = category_model.category_delete_model(payload)
    return jsonify(result), status_code