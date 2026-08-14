from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from database import Base, engine, get_db 
from passlib.context import CryptContext

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
    def verify_password(plain_password: str, password: str) -> bool:
        """Verifies if the plain text password matches the stored bcrypt hash."""
        return pwd_context.verify(plain_password, password)

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes a plain text password using bcrypt."""
        return pwd_context.hash(password)

    @classmethod
    def create_user(cls, db: Session, user_data: dict):
        """Registers a new user inside the database after hashing their password."""
        existing_user = db.query(cls).filter(cls.email == user_data.get('email')).first()
        if existing_user:
            return None

        new_user = cls(
            email=user_data.get('email'),
            # Changed attribute key to map to the 'password' column name
            password=cls.hash_password(user_data.get('password')),
            name=user_data.get('name'),
            phone=user_data.get('phone'),
            gender=user_data.get('gender')
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    @classmethod
    def authenticate_user(cls, db: Session, email: str, plain_password: str):
        """Authenticates a user by email and plain-text password verification."""
        user = db.query(cls).filter(cls.email == email).first()
        if not user or not cls.verify_password(plain_password, user.hashed_password):
            return False
        return user



class UserModel:
    def __init__(self):
        try:
            self.conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="Admin@123",
                database="discountdaddy"
            )
            self.cursor = self.conn.cursor(dictionary=True)
            self.conn.autocommit = True
        except Error as err:
            print(f"Database Connection Error: {err}")
            self.conn = None
            self.cursor = None  
        
    def user_register_model(self, form):
        """Executes secure registration via the get_db() session pipeline."""
        with get_db() as db:
            try:
                new_user = DBUser.create_user(db, form)
                if not new_user:
                    return {"error": "Email is already registered"}, 400
                
                return {
                    "message": "User registered successfully", 
                    "user_id": new_user.id
                }, 201
            except Exception as err:
                return {"error": f"Failed to register user: {err}"}, 500

    def user_login_model(self, form):
        """Performs secure credential evaluation using get_db() context pools."""
        with get_db() as db:
            try:
                email = form.get('email')
                password = form.get('password')
                
                user = DBUser.authenticate_user(db, email, password)
                if not user:
                    return {"error": "Invalid email or password"}, 401
                    
                return {
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "phone": user.phone,
                        "gender": user.gender
                    }
                }, 200
            except Exception as err:
                return {"error": f"Login pipeline failed: {err}"}, 500

    def user_getall_model(self):
        if not self.cursor:
            return {"error": "Database connection unavailable"}, 500
            
        try:
            self.cursor.execute("SELECT * FROM users")
            result = self.cursor.fetchall()            
            return {"users": result}, 200
        except Error as err:
            return {"error": f"Query execution failed: {err}"}, 500
        
    def user_addone_model(self, form):
        if not self.cursor:
            return {"error": "Database connection unavailable"}, 500
            
        try:
            plain_pass = form.get('password')
            hashed_pass = DBUser.hash_password(plain_pass) if plain_pass else ""

            query = """
                INSERT INTO users (name, email, password, phone, gender) 
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (
                form.get('name'),
                form.get('email'),
                hashed_pass,
                form.get('phone'),
                form.get('gender')
            )
            
            self.cursor.execute(query, values)
            return {"message": "User data inserted successfully"}, 201
        except Exception as err:
            return {"error": f"Failed to insert data: {err}"}, 500

    def user_update_model(self, form):
        if not self.cursor:
            return {"error": "Database connection unavailable"}, 500
            
        try:
            plain_pass = form.get('password')
            hashed_pass = DBUser.hash_password(plain_pass) if plain_pass else ""

            query = """
                UPDATE users 
                SET name=%s, phone=%s, email=%s, gender=%s, password=%s 
                WHERE id=%s
            """
            values = (
                form.get('name'),
                form.get('phone'),
                form.get('email'),
                form.get('gender'),
                hashed_pass,
                form.get('id')
            )
            
            self.cursor.execute(query, values)
            
            if self.cursor.rowcount > 0:
                return {"message": "User data updated successfully"}, 200
            else:
                return {"message": "No users found matching that ID to update"}, 404
        except Exception as err:
            return {"error": f"Failed to update data: {err}"}, 500

    def user_delete_model(self, form):
        if not self.cursor:
            return {"error": "Database connection unavailable"}, 500
            
        try:
            query = "DELETE FROM users WHERE id=%s"
            values = (form.get('id'),)  
            
            self.cursor.execute(query, values)
            
            if self.cursor.rowcount > 0:
                return {"message": "User data deleted successfully"}, 200
            else:
                return {"message": "No users found matching that ID to delete"}, 404
        except Exception as err:
            return {"error": f"Failed to delete data: {err}"}, 500
            
    def __del__(self):
        """Safely close connections when the object lifecycle ends, preventing reference errors."""
        try:
            if hasattr(self, 'cursor') and self.cursor:
                self.cursor.close()
        except Exception:
            pass

        try:
            if hasattr(self, 'conn') and self.conn:
                self.conn.close()
        except Exception:
            pass

Base.metadata.create_all(bind=engine)