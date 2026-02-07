from pydantic.v1 import BaseModel, StrictStr, Field
from typing import Any, Optional, List, Union

print("Testing raw Field")
try:
    class D(BaseModel):
        x: Any = Field(None)
    print("Any + Field OK")
except Exception as e:
    print(f"Any + Field FAILED: {e}")

print("Testing StrictStr + Field")
try:
    class E(BaseModel):
        x: StrictStr = Field(None)
    print("StrictStr + Field OK")
except Exception as e:
    print(f"StrictStr + Field FAILED: {e}")

print("Testing Optional without Field")
try:
    class F(BaseModel):
        x: Optional[Any] = None
    print("Optional without Field OK")
except Exception as e:
    print(f"Optional without Field FAILED: {e}")
