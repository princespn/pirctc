from flask import Blueprint, request, jsonify

# Create a local blueprint instance. DO NOT import app.
product_bp = Blueprint('product_bp', __name__)

@product_bp.route('/product/getall', methods=['GET'])
def product_getall():
    return jsonify({"message": "Products fetched successfully"}), 200