import hashlib
from database import get_db, Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timedelta, timezone

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    gender = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @staticmethod
    def _prepare_password(password: str) -> str:
        """
        Pre-hashes password with SHA-256 to produce a fixed 64-character string.
        Guarantees input to passlib never exceeds bcrypt's 72-byte limit.
        """
        if not password:
            return ""
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        prepared = DBUser._prepare_password(plain_password)
        return pwd_context.verify(prepared, hashed_password)

    @staticmethod
    def hash_password(password: str) -> str:
        prepared = DBUser._prepare_password(password)
        return pwd_context.hash(prepared)


class UserModel:
    def __init__(self):
        pass

    def _to_dict(self, user: DBUser):
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "gender": user.gender,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }

    def user_register_model(self, payload):
        email = payload.get('email', '').strip().lower()
        raw_password = payload.get('password', '')

        if not email or not raw_password:
            return {"error": "Email and password are required"}, 400

        with get_db() as db:
            try:
                existing_user = db.query(DBUser).filter(DBUser.email == email).first()
                if existing_user:
                    return {"error": "User with this email already exists"}, 400

                hashed_password = DBUser.hash_password(raw_password)
                new_user = DBUser(
                    email=email,
                    password=hashed_password,
                    name=payload.get('name'),
                    phone=payload.get('phone'),
                    gender=payload.get('gender')
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)

                token_payload = {
                    "sub": str(new_user.id),
                    "email": new_user.email,
                    "iat": datetime.now(timezone.utc),
                    "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
                }
                token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

                return {
                    "message": "User registered successfully",
                    "token": token,
                    "user": self._to_dict(new_user)
                }, 201
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def user_login_model(self, payload):
        email = payload.get('email', '').strip().lower()
        password = payload.get('password', '')

        if not email or not password:
            return {"error": "Email and password are required"}, 400

        with get_db() as db:
            try:
                user = db.query(DBUser).filter(DBUser.email == email).first()
                if not user or not DBUser.verify_password(password, user.password):
                    return {"error": "Invalid email or password"}, 401

                token_payload = {
                    "sub": str(user.id),
                    "email": user.email,
                    "iat": datetime.now(timezone.utc),
                    "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
                }
                token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

                return {
                    "message": "Login successful",
                    "token": token,
                    "user": self._to_dict(user)
                }, 200
            except Exception as e:
                return {"error": str(e)}, 500

    def user_getall_model(self):
        with get_db() as db:
            try:
                users = db.query(DBUser).all()
                return [self._to_dict(u) for u in users], 200
            except Exception as e:
                return {"error": str(e)}, 500

    def user_addone_model(self, payload):
        return self.user_register_model(payload)

    def user_update_model(self, payload):
        user_id = payload.get('id')
        if not user_id:
            return {"error": "User ID is required for update"}, 400

        with get_db() as db:
            try:
                user = db.query(DBUser).filter(DBUser.id == user_id).first()
                if not user:
                    return {"error": "User not found"}, 404

                if 'email' in payload:
                    user.email = payload['email'].strip().lower()
                if 'name' in payload:
                    user.name = payload['name']
                if 'phone' in payload:
                    user.phone = payload['phone']
                if 'gender' in payload:
                    user.gender = payload['gender']
                if 'password' in payload and payload['password']:
                    user.password = DBUser.hash_password(payload['password'])

                db.commit()
                db.refresh(user)
                return {"message": "User updated successfully", "user": self._to_dict(user)}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500

    def user_delete_model(self, payload):
        user_id = payload.get('id')
        if not user_id:
            return {"error": "User ID is required for deletion"}, 400

        with get_db() as db:
            try:
                user = db.query(DBUser).filter(DBUser.id == user_id).first()
                if not user:
                    return {"error": "User not found"}, 404

                db.delete(user)
                db.commit()
                return {"message": "User deleted successfully"}, 200
            except Exception as e:
                db.rollback()
                return {"error": str(e)}, 500