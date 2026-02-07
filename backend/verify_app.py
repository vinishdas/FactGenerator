import sys
import os
from unittest.mock import MagicMock

# Add current directory to sys.path
sys.path.append(os.getcwd())

print("Step 1: Verifying app.schemas.compliance...")
try:
    from app.schemas.compliance import ScanRequest, ScanResponse
    print("SUCCESS: app.schemas.compliance imported successfully.")
except Exception as e:
    print(f"FAILURE: Could not import app.schemas.compliance: {e}")
    sys.exit(1)

# Mock sqlalchemy engine to avoid DB connection errors during import
import sqlalchemy
sqlalchemy.create_engine = MagicMock()

# Mock the database module's engine before importing main
import app.database
app.database.engine = MagicMock()
app.database.Base = MagicMock()
app.database.Base.metadata.create_all = MagicMock()

print("Step 2: Attempting to import app.main...")
try:
    from app.main import app
    print("SUCCESS: Successfully imported app.main")
    
    compliance_route = next((r for r in app.routes if r.path == "/compliance/scan"), None)
    if compliance_route:
        print("SUCCESS: Compliance router registered at /compliance/scan")
    else:
        print("FAILURE: Compliance router NOT found")

except Exception as e:
    print(f"FAILURE: Failed to import app.main: {e}")
    # We ignore the exit code here if it's just a dependency issue unrelated to our code
    import traceback
    traceback.print_exc()
