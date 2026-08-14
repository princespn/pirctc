from flask import Blueprint, request, jsonify
from database import get_db
from model.category_model import DBCategory

category_bp = Blueprint('category_bp', __name__)

def category_to_dict(category: DBCategory):
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "created_at": category.created_at.isoformat() if category.created_at else None,
        "updated_at": category.updated_at.isoformat() if category.updated_at else None
    }

@category_bp.route('/categories', methods=['GET'])
def get_categories():
    db = next(get_db())
    try:
        categories = db.query(DBCategory).all()
        return jsonify([category_to_dict(c) for c in categories]), 200
    finally:
        db.close()


@category_bp.route('/categories/<int:id>', methods=['GET'])
def get_category(id):
    db = next(get_db())
    try:
        category = db.query(DBCategory).filter(DBCategory.id == id).first()
        if not category:
            return jsonify({"error": "Category not found"}), 404
        return jsonify(category_to_dict(category)), 200
    finally:
        db.close()


@category_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json() or {}

    if 'name' not in data or not data['name'].strip():
        return jsonify({"error": "Category name is required"}), 400

    db = next(get_db())
    try:
        # Check if category name already exists
        category_name = data['name'].strip()
        existing_category = db.query(DBCategory).filter(DBCategory.name == category_name).first()
        if existing_category:
            return jsonify({"error": "Category with this name already exists"}), 400

        new_category = DBCategory(
            name=category_name,
            description=data.get('description', '')
        )

        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return jsonify(category_to_dict(new_category)), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@category_bp.route('/categories/<int:id>', methods=['PUT'])
def update_category(id):
    data = request.get_json() or {}
    db = next(get_db())

    try:
        category = db.query(DBCategory).filter(DBCategory.id == id).first()
        if not category:
            return jsonify({"error": "Category not found"}), 404

        if 'name' in data:
            new_name = data['name'].strip()
            if not new_name:
                return jsonify({"error": "Category name cannot be empty"}), 400
            
            # Check duplicate name if changing
            if new_name != category.name:
                existing = db.query(DBCategory).filter(DBCategory.name == new_name).first()
                if existing:
                    return jsonify({"error": "Category with this name already exists"}), 400
            category.name = new_name

        if 'description' in data:
            category.description = data['description']

        db.commit()
        db.refresh(category)

        return jsonify(category_to_dict(category)), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@category_bp.route('/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    db = next(get_db())
    try:
        category = db.query(DBCategory).filter(DBCategory.id == id).first()
        if not category:
            return jsonify({"error": "Category not found"}), 404

        db.delete(category)
        db.commit()

        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()