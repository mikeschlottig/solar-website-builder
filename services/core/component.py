from solar import Table, ColumnDetails
from typing import Optional, List, Dict
from datetime import datetime
import uuid

class Component(Table):
    __tablename__ = "components"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to component creator
    name: str
    description: Optional[str] = None
    category: str  # e.g., 'layout', 'content', 'media', 'custom'
    component_type: str  # 'built-in' or 'custom'
    code: Optional[str] = None  # React component code for custom components
    styles: Optional[str] = None  # CSS/Tailwind styles
    props_schema: Dict = {}  # JSON schema for component properties
    preview_image_path: Optional[str] = None  # Preview image in media bucket
    is_public: bool = False  # Whether other users can use this component
    version: str = "1.0.0"
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
