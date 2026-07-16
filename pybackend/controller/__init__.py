import os
import glob
import importlib

__all__ = [
    os.path.splitext(os.path.basename(f))[0] 
    for f in glob.glob(os.path.join(os.path.dirname(__file__), "*.py")) 
    if not f.endswith('__init__.py')
]

for module_name in __all__:
    importlib.import_module(f".{module_name}", package=__name__)