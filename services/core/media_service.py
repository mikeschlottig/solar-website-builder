from typing import List, Optional
from uuid import UUID
from solar.access import User, authenticated
from solar.media import MediaFile, save_to_bucket, generate_presigned_url, delete_from_bucket
from core.media_asset import MediaAsset
from datetime import datetime

@authenticated
def upload_media(user: User, file: MediaFile, name: str, 
                website_id: Optional[UUID] = None, alt_text: Optional[str] = None,
                folder: Optional[str] = None, tags: Optional[List[str]] = None) -> MediaAsset:
    """Upload a media file and create a database record."""
    # Generate file path
    base_path = f"users/{user.id}"
    if website_id:
        base_path = f"{base_path}/websites/{website_id}"
    if folder:
        base_path = f"{base_path}/{folder}"
    
    # Save file to bucket
    file_path = save_to_bucket(file, base_path)
    
    # Create media asset record
    media_asset = MediaAsset(
        user_id=user.id,
        website_id=website_id,
        name=name,
        original_filename=name,  # In a real app, you'd extract this from the upload
        file_path=file_path,
        file_size=file.size,
        mime_type=file.mime_type,
        alt_text=alt_text,
        tags=tags or [],
        folder=folder
    )
    media_asset.sync()
    
    # Return with presigned URL
    media_asset.file_path = generate_presigned_url(file_path)
    return media_asset

@authenticated
def get_user_media(user: User, website_id: Optional[UUID] = None, 
                  folder: Optional[str] = None, mime_type_filter: Optional[str] = None) -> List[MediaAsset]:
    """Get media assets for a user, optionally filtered by website, folder, or type."""
    base_query = "SELECT * FROM media_assets WHERE user_id = %(user_id)s"
    params = {"user_id": user.id}
    
    if website_id:
        base_query += " AND website_id = %(website_id)s"
        params["website_id"] = str(website_id)
    
    if folder:
        base_query += " AND folder = %(folder)s"
        params["folder"] = folder
    
    if mime_type_filter:
        base_query += " AND mime_type LIKE %(mime_type_filter)s"
        params["mime_type_filter"] = f"{mime_type_filter}%"
    
    base_query += " ORDER BY created_at DESC"
    
    results = MediaAsset.sql(base_query, params)
    
    # Generate presigned URLs for all assets
    media_assets = []
    for result in results:
        asset = MediaAsset(**result)
        asset.file_path = generate_presigned_url(asset.file_path)
        media_assets.append(asset)
    
    return media_assets

@authenticated
def get_media_asset(user: User, asset_id: UUID) -> MediaAsset:
    """Get a specific media asset with ownership verification."""
    results = MediaAsset.sql(
        "SELECT * FROM media_assets WHERE id = %(asset_id)s AND user_id = %(user_id)s",
        {"asset_id": str(asset_id), "user_id": user.id}
    )
    if not results:
        raise ValueError("Media asset not found or access denied")
    
    asset = MediaAsset(**results[0])
    asset.file_path = generate_presigned_url(asset.file_path)
    return asset

@authenticated
def update_media_metadata(user: User, asset_id: UUID, name: Optional[str] = None,
                         alt_text: Optional[str] = None, tags: Optional[List[str]] = None,
                         folder: Optional[str] = None) -> MediaAsset:
    """Update media asset metadata."""
    # Verify ownership
    existing = MediaAsset.sql(
        "SELECT * FROM media_assets WHERE id = %(asset_id)s AND user_id = %(user_id)s",
        {"asset_id": str(asset_id), "user_id": user.id}
    )
    if not existing:
        raise ValueError("Media asset not found or access denied")
    
    # Build update query dynamically
    updates = ["updated_at = %(updated_at)s"]
    params = {"asset_id": str(asset_id), "updated_at": datetime.now()}
    
    if name is not None:
        updates.append("name = %(name)s")
        params["name"] = name
    if alt_text is not None:
        updates.append("alt_text = %(alt_text)s")
        params["alt_text"] = alt_text
    if tags is not None:
        updates.append("tags = %(tags)s")
        params["tags"] = tags
    if folder is not None:
        updates.append("folder = %(folder)s")
        params["folder"] = folder
    
    MediaAsset.sql(
        f"UPDATE media_assets SET {', '.join(updates)} WHERE id = %(asset_id)s",
        params
    )
    
    return get_media_asset(user, asset_id)

@authenticated
def delete_media_asset(user: User, asset_id: UUID) -> bool:
    """Delete a media asset and its file from storage."""
    # Get the asset to delete
    results = MediaAsset.sql(
        "SELECT * FROM media_assets WHERE id = %(asset_id)s AND user_id = %(user_id)s",
        {"asset_id": str(asset_id), "user_id": user.id}
    )
    if not results:
        raise ValueError("Media asset not found or access denied")
    
    asset = MediaAsset(**results[0])
    
    # Delete from bucket (use original path, not presigned URL)
    delete_from_bucket(asset.file_path)
    
    # Delete database record
    MediaAsset.sql(
        "DELETE FROM media_assets WHERE id = %(asset_id)s",
        {"asset_id": str(asset_id)}
    )
    
    return True

@authenticated
def organize_media(user: User, asset_ids: List[UUID], target_folder: Optional[str] = None) -> List[MediaAsset]:
    """Move multiple media assets to a different folder."""
    # Verify ownership of all assets
    placeholders = ', '.join(['%(asset_' + str(i) + ')s' for i in range(len(asset_ids))])
    params = {f'asset_{i}': str(asset_id) for i, asset_id in enumerate(asset_ids)}
    params['user_id'] = user.id
    
    results = MediaAsset.sql(
        f"SELECT id FROM media_assets WHERE id IN ({placeholders}) AND user_id = %(user_id)s",
        params
    )
    
    if len(results) != len(asset_ids):
        raise ValueError("Some assets not found or access denied")
    
    # Update folder for all assets
    MediaAsset.sql(
        f"UPDATE media_assets SET folder = %(folder)s, updated_at = %(updated_at)s WHERE id IN ({placeholders})",
        {**params, "folder": target_folder, "updated_at": datetime.now()}
    )
    
    # Return updated assets
    updated_results = MediaAsset.sql(
        f"SELECT * FROM media_assets WHERE id IN ({placeholders}) ORDER BY name",
        params
    )
    
    media_assets = []
    for result in updated_results:
        asset = MediaAsset(**result)
        asset.file_path = generate_presigned_url(asset.file_path)
        media_assets.append(asset)
    
    return media_assets
