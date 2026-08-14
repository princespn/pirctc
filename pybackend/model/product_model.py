from database import get_db, Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
from model.category_model import DBCategory


class DBProduct(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("DBCategory", back_populates="products")


class ProductModel:

    def _to_dict(self, product: DBProduct):
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

    def product_addone_model(self, payload):
        required_fields = ['name', 'price', 'category_id']
        if not all(k in payload for k in required_fields):
            return {"error": "Missing required fields (name, price, category_id)"}, 400

        with get_db() as db:
            try:
                category = db.query(DBCategory).filter(DBCategory.id == payload['category_id']).first()
                if not category:
                    return {"error": "Category does not exist"}, 404

                new_product = DBProduct(
                    name=payload['name'],
                    price=float(payload['price']),
                    description=payload.get('description', ''),
                    category_id=payload['category_id']
                )
                db.add(new_product)
                db.commit()
                db.refresh(new_product)

                return {"message": "Product created successfully", "product": self._to_dict(new_product)}, 201
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def product_getall_model(self):
        with get_db() as db:
            try:
                # joinedload eagerly fetches category data before session closes
                products = db.query(DBProduct).options(joinedload(DBProduct.category)).all()
                return [self._to_dict(p) for p in products], 200
            except Exception as e:
                return {"error": str(e)}, 500

    def product_update_model(self, payload):
        product_id = payload.get('id')
        if not product_id:
            return {"error": "Product ID is required"}, 400

        with get_db() as db:
            try:
                product = db.query(DBProduct).options(joinedload(DBProduct.category)).filter(DBProduct.id == product_id).first()
                if not product:
                    return {"error": "Product not found"}, 404

                if 'category_id' in payload:
                    category = db.query(DBCategory).filter(DBCategory.id == payload['category_id']).first()
                    if not category:
                        return {"error": "Category does not exist"}, 404
                    product.category_id = payload['category_id']

                if 'name' in payload:
                    product.name = payload['name']
                if 'price' in payload:
                    product.price = float(payload['price'])
                if 'description' in payload:
                    product.description = payload['description']

                db.commit()
                db.refresh(product)
                return {"message": "Product updated successfully", "product": self._to_dict(product)}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def product_delete_model(self, payload):
        product_id = payload.get('id')
        if not product_id:
            return {"error": "Product ID is required"}, 400

        with get_db() as db:
            try:
                product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
                if not product:
                    return {"error": "Product not found"}, 404

                db.delete(product)
                db.commit()
                return {"message": "Product deleted successfully"}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500