from database import get_db, Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to DBProduct
    products = relationship("DBProduct", back_populates="category", cascade="all, delete-orphan")


class CategoryModel:

    def _to_dict(self, category: DBCategory):
        return {
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at.isoformat() if category.created_at else None,
            "updated_at": category.updated_at.isoformat() if category.updated_at else None
        }

    def category_addone_model(self, payload):
        name = payload.get("name")
        if not name:
            return {"error": "Category name is required"}, 400

        with get_db() as db:
            try:
                existing = db.query(DBCategory).filter(DBCategory.name == name).first()
                if existing:
                    return {"error": "Category already exists"}, 400

                new_category = DBCategory(name=name)
                db.add(new_category)
                db.commit()
                db.refresh(new_category)

                return {"message": "Category created successfully", "category": self._to_dict(new_category)}, 201
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def category_getall_model(self):
        with get_db() as db:
            try:
                categories = db.query(DBCategory).all()
                return [self._to_dict(c) for c in categories], 200
            except Exception as e:
                return {"error": str(e)}, 500

    def category_update_model(self, payload):
        category_id = payload.get("id")
        name = payload.get("name")

        if not category_id or not name:
            return {"error": "Category ID and name are required"}, 400

        with get_db() as db:
            try:
                category = db.query(DBCategory).filter(DBCategory.id == category_id).first()
                if not category:
                    return {"error": "Category not found"}, 404

                category.name = name
                db.commit()
                db.refresh(category)
                return {"message": "Category updated successfully", "category": self._to_dict(category)}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def category_delete_model(self, payload):
        category_id = payload.get("id")
        if not category_id:
            return {"error": "Category ID is required"}, 400

        with get_db() as db:
            try:
                category = db.query(DBCategory).filter(DBCategory.id == category_id).first()
                if not category:
                    return {"error": "Category not found"}, 404

                db.delete(category)
                db.commit()
                return {"message": "Category deleted successfully"}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500