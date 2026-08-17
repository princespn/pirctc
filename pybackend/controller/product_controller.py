from flask import Blueprint, request, jsonify
from model.product_model import ProductModel

product_bp = Blueprint("product_bp", __name__)
product_model = ProductModel()


# 1. GET ALL PRODUCTS
@product_bp.route("/api/products", methods=["GET"])
def get_all_products():
    result, status_code = product_model.product_getall_model()
    return jsonify(result), status_code


# 2. ADD PRODUCT
@product_bp.route("/api/products", methods=["POST"])
def add_product():
    payload = request.get_json() or {}
    result, status_code = product_model.product_addone_model(payload)
    return jsonify(result), status_code


# 3. UPDATE PRODUCT
@product_bp.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    payload = request.get_json() or {}
    payload["id"] = product_id  # Inject path parameter into payload
    result, status_code = product_model.product_update_model(payload)
    return jsonify(result), status_code


# 4. DELETE PRODUCT
@product_bp.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    payload = {"id": product_id}
    result, status_code = product_model.product_delete_model(payload)
    return jsonify(result), status_code