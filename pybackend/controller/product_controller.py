from flask import Blueprint, request, jsonify
from model.product_model import DBProduct
from model.category_model import DBCategory

product_bp = Blueprint('product_bp', __name__)

# Helper function to convert DBProduct model instance to dictionary
def product_to_dict(product: DBProduct):
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "description": product.description,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None
    }


# ----------------------------------------------------
# 1. GET ALL PRODUCTS
# ----------------------------------------------------
@product_bp.route('/products', methods=['GET'])
def get_products():
    db = next(get_db())
    try:
        products = db.query(DBProduct).all()
        return jsonify([product_to_dict(p) for p in products]), 200
    finally:
        db.close()


# ----------------------------------------------------
# 2. GET SINGLE PRODUCT BY ID
# ----------------------------------------------------
@product_bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    db = next(get_db())
    try:
        product = db.query(DBProduct).filter(DBProduct.id == id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product_to_dict(product)), 200
    finally:
        db.close()


# ----------------------------------------------------
# 3. CREATE PRODUCT
# ----------------------------------------------------
@product_bp.route('/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}
    
    # Validation
    required_fields = ['name', 'price', 'category_id']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Missing required fields (name, price, category_id)"}), 400

    db = next(get_db())
    try:
        # Check if category exists
        category = db.query(DBCategory).filter(DBCategory.id == data['category_id']).first()
        if not category:
            return jsonify({"error": "Category does not exist"}), 404

        new_product = DBProduct(
            name=data['name'],
            price=float(data['price']),
            description=data.get('description', ''),
            category_id=data['category_id']
        )
        
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return jsonify(product_to_dict(new_product)), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# ----------------------------------------------------
# 4. UPDATE PRODUCT
# ----------------------------------------------------
@product_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.get_json() or {}
    db = next(get_db())
    
    try:
        product = db.query(DBProduct).filter(DBProduct.id == id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Validate category if updating category_id
        if 'category_id' in data:
            category = db.query(DBCategory).filter(DBCategory.id == data['category_id']).first()
            if not category:
                return jsonify({"error": "Category does not exist"}), 404
            product.category_id = data['category_id']

        if 'name' in data:
            product.name = data['name']
        if 'price' in data:
            product.price = float(data['price'])
        if 'description' in data:
            product.description = data['description']

        db.commit()
        db.refresh(product)

        return jsonify(product_to_dict(product)), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# ----------------------------------------------------
# 5. DELETE PRODUCT
# ----------------------------------------------------
@product_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    db = next(get_db())
    try:
        product = db.query(DBProduct).filter(DBProduct.id == id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        db.delete(product)
        db.commit()

        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()