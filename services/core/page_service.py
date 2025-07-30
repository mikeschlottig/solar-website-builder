from typing import List, Optional, Dict
from uuid import UUID
from solar.access import User, authenticated
from core.page import Page
from core.website import Website
from datetime import datetime

@authenticated
def create_page(user: User, website_id: UUID, title: str, slug: str,
               meta_description: Optional[str] = None) -> Page:
    """Create a new page for a website."""
    # Verify website ownership
    website_results = Website.sql(
        "SELECT * FROM websites WHERE id = %(website_id)s AND user_id = %(user_id)s",
        {"website_id": str(website_id), "user_id": user.id}
    )
    if not website_results:
        raise ValueError("Website not found or access denied")
    
    # Ensure slug is unique within the website
    existing = Page.sql(
        "SELECT * FROM pages WHERE website_id = %(website_id)s AND slug = %(slug)s",
        {"website_id": str(website_id), "slug": slug}
    )
    if existing:
        raise ValueError("Page with this slug already exists")
    
    # Get next sort order
    sort_results = Page.sql(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM pages WHERE website_id = %(website_id)s",
        {"website_id": str(website_id)}
    )
    next_order = sort_results[0]["next_order"]
    
    page = Page(
        website_id=website_id,
        title=title,
        slug=slug,
        meta_description=meta_description,
        content_structure={"components": []},
        styles={},
        sort_order=next_order
    )
    page.sync()
    return page

@authenticated
def get_website_pages(user: User, website_id: UUID) -> List[Page]:
    """Get all pages for a website."""
    # Verify website ownership
    website_results = Website.sql(
        "SELECT * FROM websites WHERE id = %(website_id)s AND user_id = %(user_id)s",
        {"website_id": str(website_id), "user_id": user.id}
    )
    if not website_results:
        raise ValueError("Website not found or access denied")
    
    results = Page.sql(
        "SELECT * FROM pages WHERE website_id = %(website_id)s ORDER BY sort_order, created_at",
        {"website_id": str(website_id)}
    )
    return [Page(**result) for result in results]

@authenticated
def get_page(user: User, page_id: UUID) -> Page:
    """Get a specific page with ownership verification."""
    results = Page.sql(
        "SELECT p.* FROM pages p JOIN websites w ON p.website_id = w.id WHERE p.id = %(page_id)s AND w.user_id = %(user_id)s",
        {"page_id": str(page_id), "user_id": user.id}
    )
    if not results:
        raise ValueError("Page not found or access denied")
    return Page(**results[0])

@authenticated
def update_page_content(user: User, page_id: UUID, content_structure: Dict) -> Page:
    """Update the content structure of a page."""
    # Verify ownership
    existing = get_page(user, page_id)
    
    Page.sql(
        "UPDATE pages SET content_structure = %(content_structure)s, updated_at = %(updated_at)s WHERE id = %(page_id)s",
        {"content_structure": content_structure, "updated_at": datetime.now(), "page_id": str(page_id)}
    )
    
    return get_page(user, page_id)

@authenticated
def update_page_metadata(user: User, page_id: UUID, title: Optional[str] = None,
                        slug: Optional[str] = None, meta_description: Optional[str] = None,
                        meta_keywords: Optional[str] = None) -> Page:
    """Update page metadata."""
    # Verify ownership
    existing = get_page(user, page_id)
    
    # Build update query dynamically
    updates = ["updated_at = %(updated_at)s"]
    params = {"page_id": str(page_id), "updated_at": datetime.now()}
    
    if title is not None:
        updates.append("title = %(title)s")
        params["title"] = title
    if slug is not None:
        # Check for slug uniqueness within the website
        slug_check = Page.sql(
            "SELECT * FROM pages WHERE website_id = %(website_id)s AND slug = %(slug)s AND id != %(page_id)s",
            {"website_id": str(existing.website_id), "slug": slug, "page_id": str(page_id)}
        )
        if slug_check:
            raise ValueError("Page with this slug already exists")
        updates.append("slug = %(slug)s")
        params["slug"] = slug
    if meta_description is not None:
        updates.append("meta_description = %(meta_description)s")
        params["meta_description"] = meta_description
    if meta_keywords is not None:
        updates.append("meta_keywords = %(meta_keywords)s")
        params["meta_keywords"] = meta_keywords
    
    Page.sql(
        f"UPDATE pages SET {', '.join(updates)} WHERE id = %(page_id)s",
        params
    )
    
    return get_page(user, page_id)

@authenticated
def update_page_styles(user: User, page_id: UUID, styles: Dict) -> Page:
    """Update page-specific styles."""
    # Verify ownership
    existing = get_page(user, page_id)
    
    Page.sql(
        "UPDATE pages SET styles = %(styles)s, updated_at = %(updated_at)s WHERE id = %(page_id)s",
        {"styles": styles, "updated_at": datetime.now(), "page_id": str(page_id)}
    )
    
    return get_page(user, page_id)

@authenticated
def publish_page(user: User, page_id: UUID) -> Page:
    """Publish a page."""
    # Verify ownership
    existing = get_page(user, page_id)
    
    Page.sql(
        "UPDATE pages SET is_published = true, updated_at = %(updated_at)s WHERE id = %(page_id)s",
        {"updated_at": datetime.now(), "page_id": str(page_id)}
    )
    
    return get_page(user, page_id)

@authenticated
def delete_page(user: User, page_id: UUID) -> bool:
    """Delete a page."""
    # Verify ownership and prevent deletion of home page
    existing = get_page(user, page_id)
    if existing.is_home_page:
        raise ValueError("Cannot delete the home page")
    
    Page.sql(
        "DELETE FROM pages WHERE id = %(page_id)s",
        {"page_id": str(page_id)}
    )
    
    return True

@authenticated
def reorder_pages(user: User, website_id: UUID, page_orders: List[Dict]) -> List[Page]:
    """Reorder pages by updating their sort_order values."""
    # Verify website ownership
    website_results = Website.sql(
        "SELECT * FROM websites WHERE id = %(website_id)s AND user_id = %(user_id)s",
        {"website_id": str(website_id), "user_id": user.id}
    )
    if not website_results:
        raise ValueError("Website not found or access denied")
    
    # Update sort orders
    for order_data in page_orders:
        Page.sql(
            "UPDATE pages SET sort_order = %(sort_order)s WHERE id = %(page_id)s AND website_id = %(website_id)s",
            {
                "sort_order": order_data["sort_order"],
                "page_id": str(order_data["page_id"]),
                "website_id": str(website_id)
            }
        )
    
    return get_website_pages(user, website_id)
