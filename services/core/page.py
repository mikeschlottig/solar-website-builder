from solar import Table, ColumnDetails
from typing import Optional, List, Dict
from datetime import datetime
import uuid

class Page(Table):
    __tablename__ = "pages"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    website_id: uuid.UUID  # Reference to parent website
    title: str
    slug: str  # URL path for the page
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    content_structure: Dict = {}  # JSON structure of page components
    styles: Dict = {}  # Page-specific styling configuration
    is_home_page: bool = False
    is_published: bool = False
    sort_order: int = 0
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
