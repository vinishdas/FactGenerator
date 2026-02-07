import sys
from typing import Any

# Monkeypatch pydantic.v1 before spacy imports it
try:
    from pydantic.v1.fields import ModelField
    from pydantic.v1 import errors as errors_
    from pydantic.v1 import schema as schema_
    
    # Patch 1: Handle failed type inference in ModelField
    original_set_default = ModelField._set_default_and_type

    def patched_set_default(self, *args, **kwargs):
        try:
            return original_set_default(self, *args, **kwargs)
        except errors_.ConfigError as e:
            if "unable to infer type" in str(e):
                self.type_ = Any
                self.outer_type_ = Any
                self.sub_fields = None
                self.key_field = None
                self.validators = []
                self.pre_validators = []
                self.post_validators = []
                self.required = False
                self.allow_none = True
                print(f"Warning: Pydantic V1 patched for field '{self.name}' - defaulting to Any")
                return
            raise e

    ModelField._set_default_and_type = patched_set_default
    
    # Patch 2: Handle unenforceable constraints in get_annotation_from_field_info
    original_get_annotation = schema_.get_annotation_from_field_info

    def patched_get_annotation(annotation, field_info, field_name, validate_assignment):
        try:
            return original_get_annotation(annotation, field_info, field_name, validate_assignment)
        except ValueError as e:
            if "unenforced-field-constraints" in str(e) or "constraints are set but not enforced" in str(e):
                print(f"Warning: Suppressing unenforceable constraints error for field '{field_name}'")
                return annotation
            raise e

    schema_.get_annotation_from_field_info = patched_get_annotation

    print("Pydantic V1 monkeypatch applied (inference + constraints)")
except ImportError:
    print("Could not import pydantic.v1 for patching")

import spacy
print('Spacy imported successfully')
