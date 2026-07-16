cd /var/www/html/python
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install flask mysql-connector-python
flask --app app run

export PYTHONDONTWRITEBYTECODE=1
pip install mysql-connector-python
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] pyjwt[crypto] pydantic[email]
pip install fastapi uvicorn sqlalchemy mysql-connector-python passlib[bcrypt] pyjwt

uvicorn main:app --reload
pip install pymysql

pip install python-multipart
