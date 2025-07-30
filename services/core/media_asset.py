from solar import Table, ColumnDetails
from typing import Optional, List, Dict
from datetime import datetime
import uuid

class MediaAsset(Table):
    __tablename__ = "media_assets"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to asset owner
    website_id: Optional[uuid.UUID] = None  # Optional reference to specific website
    name: str
    original_filename: str
    file_path: str  # Path in media bucket
    file_size: int  # Size in bytes
    mime_type: str
    alt_text: Optional[str] = None
    tags: List[str] = []
    folder: Optional[str] = None  # Organization folder
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
