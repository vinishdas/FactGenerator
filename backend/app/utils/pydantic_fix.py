import sys
from typing import Any

def apply_monkeypatch():
    try:
        from pydantic.v1.fields import ModelField
        from pydantic.v1 import errors as errors_
        from pydantic.v1 import schema as schema_
        
        # Patch 1: Handle failed type inference in ModelField
        # This handles ConfigError: unable to infer type for attribute "REGEX"
        original_set_default = ModelField._set_default_and_type

        def patched_set_default(self, *args, **kwargs):
            try:
                return original_set_default(self, *args, **kwargs)
            except errors_.ConfigError as e:
                # Catch "unable to infer type" error and fallback to Any
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
                    # Optimization: Don't print warning in production unless needed'
                    return
                raise e

        ModelField._set_default_and_type = patched_set_default
        
        # Patch 2: Handle unenforceable constraints in get_annotation_from_field_info
        # This handles ValueError: On field "checksum" the following field constraints are set but not enforced: regex
        original_get_annotation = schema_.get_annotation_from_field_info

        def patched_get_annotation(annotation, field_info, field_name, validate_assignment):
            try:
                return original_get_annotation(annotation, field_info, field_name, validate_assignment)
            except ValueError as e:
                if "unenforced-field-constraints" in str(e) or "constraints are set but not enforced" in str(e):
                    return annotation
                raise e

        schema_.get_annotation_from_field_info = patched_get_annotation

        print("Applied Pydantic V1 compatibility patch for Python 3.14")
    except ImportError:
        print("Could not verify pydantic.v1 presence, skipping patch")
    except Exception as e:
        print(f"Failed to apply pydantic patch: {e}")

apply_monkeypatch()
