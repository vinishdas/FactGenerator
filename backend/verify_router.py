import sys
import os
from unittest.mock import MagicMock

sys.path.append(os.getcwd())

# Mock dependencies
sys.modules['app.services.compliance_engine'] = MagicMock()
sys.modules['app.database'] = MagicMock()
sys.modules['sqlalchemy.orm'] = MagicMock()

try:
    from app.routers.compliance import router
    print("SUCCESS: app.routers.compliance imported successfully.")
    
    print(f"Routes found: {len(router.routes)}")
    for r in router.routes:
        print(f"  - Path: {r.path}, Methods: {r.methods}")

except Exception as e:
    print(f"FAILURE: Could not import app.routers.compliance: {e}")
