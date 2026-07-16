from flask import Blueprint, request, jsonify

# 1. Create a local blueprint instance. DO NOT import app.
category_bp = Blueprint('category_bp', __name__)

@category_bp.route('/category/getall', methods=['GET'])
def category_getall():
    return jsonify({"message": "Categories fetched successfully"}), 200