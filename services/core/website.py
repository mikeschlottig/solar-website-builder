from solar import Table, ColumnDetails
from typing import Optional, List, Dict
from datetime import datetime
import uuid

class Website(Table):
    __tablename__ = "websites"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to authenticated user
    name: str
    description: Optional[str] = None
    domain: Optional[str] = None
    favicon_path: Optional[str] = None  # Path to favicon in media bucket
    theme_config: Dict = {}  # JSON configuration for theme settings
    seo_config: Dict = {}  # Global SEO settings
    is_published: bool = False
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
