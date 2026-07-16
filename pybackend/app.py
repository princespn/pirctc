# Use a production WSGI server instead.
from flask import Flask
import sys
import controller
from controller import *
from flask_cors import CORS 
 
app = Flask(__name__)

CORS(app)
for module_name in controller.__all__:
    module = sys.modules[f"controller.{module_name}"]
    
    for item_name in dir(module):
        item = getattr(module, item_name)
        if hasattr(item, '__class__') and item.__class__.__name__ == 'Blueprint':
            app.register_blueprint(item)
            print(f"✓ Dynamically registered blueprint: {module_name}.{item_name}")

@app.route('/')
def index():
    return {"status": "Backend Server Online"}, 200

if __name__ == '__main__':
    app.run(debug=True)