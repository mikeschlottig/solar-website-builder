from typing import List, Optional
from uuid import UUID
from solar.access import User, authenticated, public
from solar.media import MediaFile, save_to_bucket, generate_presigned_url
from core.website import Website
from core.page import Page
from datetime import datetime

@authenticated
def create_website(user: User, name: str, description: Optional[str] = None) -> Website:
    """Create a new website for the authenticated user."""
    website = Website(
        user_id=user.id,
        name=name,
        description=description,
        theme_config={"primary_color": "#3b82f6", "font_family": "Inter"},
        seo_config={"site_title": name, "site_description": description or ""}
    )
    website.sync()
    
    # Create default home page
    home_page = Page(
        website_id=website.id,
        title="Home",
        slug="/",
        meta_description=f"Welcome to {name}",
        content_structure={"components": []},
        is_home_page=True,
        is_published=True
    )
    home_page.sync()
    
    return website

@authenticated
def get_user_websites(user: User) -> List[Website]:
    """Get all websites belonging to the authenticated user."""
    results = Website.sql(
        "SELECT * FROM websites WHERE user_id = %(user_id)s ORDER BY updated_at DESC",
        {"user_id": user.id}
    )
    return [Website(**result) for result in results]

@authenticated
def get_website(user: User, website_id: UUID) -> Website:
    """Get a specific website belonging to the authenticated user."""
    results = Website.sql(
        "SELECT * FROM websites WHERE id = %(website_id)s AND user_id = %(user_id)s",
        {"website_id": str(website_id), "user_id": user.id}
    )
    if not results:
        raise ValueError("Website not found or access denied")
    
    website = Website(**results[0])
    
    # Generate presigned URL for favicon if it exists
    if website.favicon_path:
        website.favicon_path = generate_presigned_url(website.favicon_path)
    
    return website

@authenticated
def update_website(user: User, website_id: UUID, name: Optional[str] = None, 
                  description: Optional[str] = None, domain: Optional[str] = None,
                  theme_config: Optional[dict] = None, seo_config: Optional[dict] = None) -> Website:
    """Update website settings."""
    # First verify ownership
    existing = get_website(user, website_id)
    
    # Build update query dynamically
    updates = ["updated_at = %(updated_at)s"]
    params = {"website_id": str(website_id), "updated_at": datetime.now()}
    
    if name is not None:
        updates.append("name = %(name)s")
        params["name"] = name
    if description is not None:
        updates.append("description = %(description)s")
        params["description"] = description
    if domain is not None:
        updates.append("domain = %(domain)s")
        params["domain"] = domain
    if theme_config is not None:
        updates.append("theme_config = %(theme_config)s")
        params["theme_config"] = theme_config
    if seo_config is not None:
        updates.append("seo_config = %(seo_config)s")
        params["seo_config"] = seo_config
    
    Website.sql(
        f"UPDATE websites SET {', '.join(updates)} WHERE id = %(website_id)s",
        params
    )
    
    return get_website(user, website_id)

@authenticated
def upload_favicon(user: User, website_id: UUID, favicon: MediaFile) -> Website:
    """Upload and set favicon for a website."""
    # Verify ownership
    existing = get_website(user, website_id)
    
    # Save favicon to bucket
    file_path = save_to_bucket(favicon, f"websites/{website_id}/favicon")
    
    # Update website with favicon path
    Website.sql(
        "UPDATE websites SET favicon_path = %(favicon_path)s, updated_at = %(updated_at)s WHERE id = %(website_id)s",
        {"favicon_path": file_path, "updated_at": datetime.now(), "website_id": str(website_id)}
    )
    
    return get_website(user, website_id)

@authenticated
def delete_website(user: User, website_id: UUID) -> bool:
    """Delete a website and all its associated data."""
    # Verify ownership
    existing = get_website(user, website_id)
    
    # Delete associated pages
    Page.sql(
        "DELETE FROM pages WHERE website_id = %(website_id)s",
        {"website_id": str(website_id)}
    )
    
    # Delete the website
    Website.sql(
        "DELETE FROM websites WHERE id = %(website_id)s",
        {"website_id": str(website_id)}
    )
    
    return True

@authenticated
def publish_website(user: User, website_id: UUID) -> Website:
    """Publish a website (make it live)."""
    # Verify ownership
    existing = get_website(user, website_id)
    
    Website.sql(
        "UPDATE websites SET is_published = true, updated_at = %(updated_at)s WHERE id = %(website_id)s",
        {"updated_at": datetime.now(), "website_id": str(website_id)}
    )
    
    return get_website(user, website_id)
