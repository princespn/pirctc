cd /var/www/html/python
rm -rf venv
# Create a virtual environment
python3 -m venv venv

# Activate Virtual Environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install third-party packages
pip install requests
# 1. Install Flask (and wheel/pip updates) in your active venv
pip install flask
# 2. If you have a requirements.txt file, install all project dependencies
pip install -r requirements.txt
python3 -m flask --app app run

pip install --upgrade pip
pip install flask mysql-connector-python
flask --app app run

export PYTHONDONTWRITEBYTECODE=1
pip install mysql-connector-python
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] pyjwt[crypto] pydantic[email]
pip install fastapi uvicorn sqlalchemy mysql-connector-python passlib[bcrypt] pyjwt

pip install Flask-Migrate
python3 -m flask --app app db init
python3 -m flask --app app db migrate -m "Initial migration for categories and products"
python3 -m flask --app app db upgrade
python3 -m flask --app app db migrate -m "Added stock_quantity to product"

python3 -m flask --app app db upgrade
# Rollback last migration (if needed):
python3 -m flask --app app db downgrade

uvicorn main:app --reload
pip install pymysql

pip install python-multipart
pip install Flask-JWT-Extended werkzeug
pip install flask-cors

./venv/bin/pip install sqlalchemy pymysql flask-cors passlib bcrypt
./venv/bin/pip install mysql-connector-python
