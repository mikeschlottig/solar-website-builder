from typing import List, Optional, Dict, Any
from uuid import UUID
from solar.access import User, authenticated, public
from solar.media import MediaFile, save_to_bucket, generate_presigned_url
from core.component import Component
from datetime import datetime
import json

@authenticated
def create_custom_component(user: User, name: str, code: str, 
                           description: Optional[str] = None,
                           category: str = "custom",
                           styles: Optional[str] = None,
                           props_schema: Optional[Dict] = None) -> Component:
    """Create a new custom React component."""
    # Validate component code (basic validation)
    if not code.strip():
        raise ValueError("Component code cannot be empty")
    
    if not code.strip().startswith("function") and not code.strip().startswith("const") and not code.strip().startswith("export"):
        raise ValueError("Component code must be a valid React component")
    
    component = Component(
        user_id=user.id,
        name=name,
        description=description,
        category=category,
        component_type="custom",
        code=code,
        styles=styles or "",
        props_schema=props_schema or {},
        is_public=False
    )
    component.sync()
    return component

@authenticated
def get_user_components(user: User, category: Optional[str] = None) -> List[Component]:
    """Get all components created by the user, optionally filtered by category."""
    if category:
        results = Component.sql(
            "SELECT * FROM components WHERE user_id = %(user_id)s AND category = %(category)s ORDER BY updated_at DESC",
            {"user_id": user.id, "category": category}
        )
    else:
        results = Component.sql(
            "SELECT * FROM components WHERE user_id = %(user_id)s ORDER BY updated_at DESC",
            {"user_id": user.id}
        )
    
    components = []
    for result in results:
        component = Component(**result)
        # Generate presigned URL for preview image if it exists
        if component.preview_image_path:
            component.preview_image_path = generate_presigned_url(component.preview_image_path)
        components.append(component)
    
    return components

@public
def get_built_in_components() -> List[Component]:
    """Get all built-in components available to all users."""
    
    # Define built-in components with consistent UUIDs
    built_in_components = [
        # Exit Intent Components
        {
            "id": "exit-intent-discount",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Discount Offer",
            "description": "Last-chance discount modal triggered when users are about to leave",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 3000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "aggressive": {
                    "type": "boolean",
                    "default": False,
                    "description": "Use aggressive detection (tab switching, etc.)"
                },
                "urgencyText": {
                    "type": "string",
                    "default": "WAIT! Don't Leave Yet",
                    "description": "Urgency message"
                },
                "discount": {
                    "type": "string",
                    "default": "20% OFF",
                    "description": "Discount amount"
                },
                "subtitle": {
                    "type": "string",
                    "default": "Get an exclusive discount before you go!",
                    "description": "Modal subtitle"
                },
                "terms": {
                    "type": "string",
                    "default": "Valid for 24 hours. One-time use only.",
                    "description": "Terms and conditions"
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 1,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-freebie",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Free Resource",
            "description": "Free download offer modal triggered on exit intent",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 5000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "title": {
                    "type": "string",
                    "default": "Free Resource",
                    "description": "Modal title"
                },
                "subtitle": {
                    "type": "string",
                    "default": "Download our exclusive guide before you leave!",
                    "description": "Modal subtitle"
                },
                "benefits": {
                    "type": "string",
                    "default": "Comprehensive guide (PDF)\nActionable tips and strategies\nBonus templates included",
                    "description": "List of benefits (one per line)",
                    "multiline": True
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 7,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-newsletter",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Newsletter Signup",
            "description": "Newsletter subscription modal triggered on exit intent",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 10000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "title": {
                    "type": "string",
                    "default": "Stay Connected",
                    "description": "Modal title"
                },
                "subtitle": {
                    "type": "string",
                    "default": "Get weekly tips and insights delivered to your inbox",
                    "description": "Modal subtitle"
                },
                "description": {
                    "type": "string",
                    "default": "Join 10,000+ subscribers who get actionable insights every week",
                    "description": "Newsletter description"
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 30,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-demo",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Demo Request",
            "description": "Quick demo scheduling modal triggered on exit intent",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 7000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "title": {
                    "type": "string",
                    "default": "Quick Demo?",
                    "description": "Modal title"
                },
                "subtitle": {
                    "type": "string",
                    "default": "See how it works in just 5 minutes",
                    "description": "Modal subtitle"
                },
                "demoPoints": {
                    "type": "string",
                    "default": "Live product walkthrough\nKey features demonstration\nQ&A with product expert",
                    "description": "Demo highlights (one per line)",
                    "multiline": True
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 3,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-survey",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Feedback Survey",
            "description": "Quick feedback survey modal triggered on exit intent",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 2000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "title": {
                    "type": "string",
                    "default": "Quick Question",
                    "description": "Modal title"
                },
                "subtitle": {
                    "type": "string",
                    "default": "Help us improve - what made you want to leave?",
                    "description": "Modal subtitle"
                },
                "options": {
                    "type": "string",
                    "default": "Too expensive\nNot what I was looking for\nNeed to think about it\nFound a better alternative\nJust browsing",
                    "description": "Survey options (one per line)",
                    "multiline": True
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 7,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-social",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Social Follow",
            "description": "Social media follow modal triggered on exit intent",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "enabled": {
                    "type": "boolean",
                    "default": True,
                    "description": "Enable exit intent detection"
                },
                "delay": {
                    "type": "number",
                    "default": 15000,
                    "description": "Delay before activation (milliseconds)"
                },
                "threshold": {
                    "type": "number",
                    "default": 20,
                    "description": "Mouse threshold for detection (pixels)"
                },
                "title": {
                    "type": "string",
                    "default": "Follow Us",
                    "description": "Modal title"
                },
                "subtitle": {
                    "type": "string",
                    "default": "Stay updated with our latest content and offers",
                    "description": "Modal subtitle"
                },
                "facebookUrl": {
                    "type": "string",
                    "default": "https://facebook.com/yourpage",
                    "description": "Facebook page URL"
                },
                "twitterUrl": {
                    "type": "string",
                    "default": "https://twitter.com/yourhandle",
                    "description": "Twitter profile URL"
                },
                "linkedinUrl": {
                    "type": "string",
                    "default": "https://linkedin.com/company/yourcompany",
                    "description": "LinkedIn page URL"
                },
                "instagramUrl": {
                    "type": "string",
                    "default": "https://instagram.com/yourhandle",
                    "description": "Instagram profile URL"
                },
                "cookieExpire": {
                    "type": "number",
                    "default": 14,
                    "description": "Days before showing again"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        # Exit Intent Funnel Templates
        {
            "id": "exit-intent-ecommerce-funnel",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - E-commerce Funnel",
            "description": "Complete exit intent funnel for e-commerce sites",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "primaryOffer": {
                    "type": "select",
                    "options": ["discount", "free-shipping", "bundle"],
                    "default": "discount",
                    "description": "Primary exit offer type"
                },
                "discountAmount": {
                    "type": "string",
                    "default": "15%",
                    "description": "Discount percentage or amount"
                },
                "minimumOrder": {
                    "type": "string",
                    "default": "$50",
                    "description": "Minimum order for offer"
                },
                "urgencyTimer": {
                    "type": "boolean",
                    "default": True,
                    "description": "Show countdown timer"
                },
                "socialProof": {
                    "type": "string",
                    "default": "Join 25,000+ happy customers",
                    "description": "Social proof message"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-saas-funnel",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - SaaS Funnel",
            "description": "Complete exit intent funnel for SaaS products",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "primaryOffer": {
                    "type": "select",
                    "options": ["extended-trial", "demo", "free-tier"],
                    "default": "extended-trial",
                    "description": "Primary exit offer type"
                },
                "trialExtension": {
                    "type": "string",
                    "default": "30 days",
                    "description": "Extended trial duration"
                },
                "demoLength": {
                    "type": "string",
                    "default": "15 minutes",
                    "description": "Demo duration"
                },
                "valueProposition": {
                    "type": "string",
                    "default": "See why 10,000+ teams choose us",
                    "description": "Main value proposition"
                },
                "riskReversal": {
                    "type": "string",
                    "default": "No credit card required • Cancel anytime",
                    "description": "Risk reversal message"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "exit-intent-lead-gen-funnel",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Exit Intent - Lead Generation Funnel",
            "description": "Complete exit intent funnel for lead generation",
            "category": "Exit Intent",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "primaryOffer": {
                    "type": "select",
                    "options": ["ebook", "webinar", "consultation", "checklist"],
                    "default": "ebook",
                    "description": "Primary lead magnet type"
                },
                "leadMagnetTitle": {
                    "type": "string",
                    "default": "Ultimate Guide to [Your Topic]",
                    "description": "Lead magnet title"
                },
                "leadMagnetDescription": {
                    "type": "string",
                    "default": "Get the complete guide that helped 5,000+ professionals",
                    "description": "Lead magnet description"
                },
                "benefits": {
                    "type": "string",
                    "default": "Step-by-step strategies\nReal-world examples\nActionable templates\nBonus resources",
                    "description": "Lead magnet benefits (one per line)",
                    "multiline": True
                },
                "socialProof": {
                    "type": "string",
                    "default": "Downloaded by 5,000+ professionals",
                    "description": "Social proof for lead magnet"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        # Hero Sections (keeping existing ones)
        {
            "id": "hero-classic",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Hero Section - Classic",
            "description": "Traditional centered hero with title, subtitle, and CTA button",
            "category": "Heroes",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "title": {
                    "type": "string",
                    "default": "Transform Your Business Today",
                    "description": "Main hero title",
                    "required": True
                },
                "subtitle": {
                    "type": "string",
                    "default": "Discover powerful solutions that drive growth and success for your company",
                    "description": "Supporting subtitle text",
                    "multiline": True
                },
                "buttonText": {
                    "type": "string",
                    "default": "Get Started Free",
                    "description": "Primary CTA button text"
                },
                "buttonLink": {
                    "type": "string",
                    "default": "#signup",
                    "description": "Primary CTA button link"
                },
                "secondaryButtonText": {
                    "type": "string",
                    "default": "",
                    "description": "Secondary button text (optional)"
                },
                "secondaryButtonLink": {
                    "type": "string",
                    "default": "#learn-more",
                    "description": "Secondary button link"
                },
                "backgroundImage": {
                    "type": "image",
                    "default": "",
                    "description": "Background image (optional)"
                },
                "backgroundColor": {
                    "type": "color",
                    "default": "#1f2937",
                    "description": "Background color"
                },
                "textColor": {
                    "type": "color",
                    "default": "#ffffff",
                    "description": "Text color"
                },
                "textAlign": {
                    "type": "select",
                    "options": ["left", "center", "right"],
                    "default": "center",
                    "description": "Text alignment"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        # Basic Components (keeping existing ones)
        {
            "id": "text-block",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Text Block",
            "description": "Simple text content with rich formatting options",
            "category": "Content",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "text": {
                    "type": "string", 
                    "default": "Your text here",
                    "description": "The text content to display",
                    "multiline": True,
                    "required": True
                },
                "fontSize": {
                    "type": "select", 
                    "options": ["xs", "sm", "base", "lg", "xl", "2xl", "3xl"], 
                    "default": "base",
                    "description": "Font size of the text"
                },
                "textAlign": {
                    "type": "select", 
                    "options": ["left", "center", "right", "justify"], 
                    "default": "left",
                    "description": "Text alignment"
                },
                "color": {
                    "type": "color", 
                    "default": "#000000",
                    "description": "Text color"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "heading",
            "user_id": "00000000-0000-0000-0000-000000000000",
            "name": "Heading",
            "description": "Heading text with different levels (H1-H6)",
            "category": "Content",
            "component_type": "built-in",
            "code": "",
            "styles": "",
            "props_schema": {
                "text": {
                    "type": "string", 
                    "default": "Your heading here",
                    "description": "Heading text",
                    "required": True
                },
                "level": {
                    "type": "select", 
                    "options": ["h1", "h2", "h3", "h4", "h5", "h6"], 
                    "default": "h2",
                    "description": "Heading level"
                },
                "textAlign": {
                    "type": "select", 
                    "options": ["left", "center", "right"], 
                    "default": "left",
                    "description": "Text alignment"
                },
                "color": {
                    "type": "color", 
                    "default": "#000000",
                    "description": "Text color"
                }
            },
            "is_public": False,
            "version": "1.0.0",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    return [Component(**comp) for comp in built_in_components]

@public
def get_public_components(category: Optional[str] = None) -> List[Component]:
    """Get all public custom components, optionally filtered by category."""
    if category:
        results = Component.sql(
            "SELECT * FROM components WHERE is_public = true AND category = %(category)s ORDER BY updated_at DESC",
            {"category": category}
        )
    else:
        results = Component.sql(
            "SELECT * FROM components WHERE is_public = true ORDER BY updated_at DESC"
        )
    
    components = []
    for result in results:
        component = Component(**result)
        # Generate presigned URL for preview image if it exists
        if component.preview_image_path:
            component.preview_image_path = generate_presigned_url(component.preview_image_path)
        components.append(component)
    
    return components

@authenticated
def get_component(user: User, component_id: UUID) -> Component:
    """Get a specific component with ownership verification."""
    # First check built-in components
    built_in_components = get_built_in_components()
    for component in built_in_components:
        if component.id == str(component_id):
            return component
    
    # Then check user's components and public components
    results = Component.sql(
        "SELECT * FROM components WHERE id = %(component_id)s AND (user_id = %(user_id)s OR is_public = true)",
        {"component_id": str(component_id), "user_id": user.id}
    )
    if not results:
        raise ValueError("Component not found or access denied")
    
    component = Component(**results[0])
    # Generate presigned URL for preview image if it exists
    if component.preview_image_path:
        component.preview_image_path = generate_presigned_url(component.preview_image_path)
    
    return component

@authenticated
def update_component(user: User, component_id: UUID, name: Optional[str] = None,
                    description: Optional[str] = None, code: Optional[str] = None,
                    styles: Optional[str] = None, props_schema: Optional[Dict] = None,
                    is_public: Optional[bool] = None) -> Component:
    """Update a custom component."""
    # Verify ownership
    existing = Component.sql(
        "SELECT * FROM components WHERE id = %(component_id)s AND user_id = %(user_id)s",
        {"component_id": str(component_id), "user_id": user.id}
    )
    if not existing:
        raise ValueError("Component not found or access denied")
    
    # Build update query dynamically
    updates = ["updated_at = %(updated_at)s", "version = %(version)s"]
    params = {
        "component_id": str(component_id), 
        "updated_at": datetime.now(),
        "version": "1.0.1"  # Simple versioning
    }
    
    if name is not None:
        updates.append("name = %(name)s")
        params["name"] = name
    if description is not None:
        updates.append("description = %(description)s")
        params["description"] = description
    if code is not None:
        # Basic validation
        if not code.strip():
            raise ValueError("Component code cannot be empty")
        updates.append("code = %(code)s")
        params["code"] = code
    if styles is not None:
        updates.append("styles = %(styles)s")
        params["styles"] = styles
    if props_schema is not None:
        updates.append("props_schema = %(props_schema)s")
        params["props_schema"] = props_schema
    if is_public is not None:
        updates.append("is_public = %(is_public)s")
        params["is_public"] = is_public
    
    Component.sql(
        f"UPDATE components SET {', '.join(updates)} WHERE id = %(component_id)s",
        params
    )
    
    return get_component(user, component_id)

@authenticated
def upload_component_preview(user: User, component_id: UUID, preview_image: MediaFile) -> Component:
    """Upload a preview image for a component."""
    # Verify ownership
    existing = Component.sql(
        "SELECT * FROM components WHERE id = %(component_id)s AND user_id = %(user_id)s",
        {"component_id": str(component_id), "user_id": user.id}
    )
    if not existing:
        raise ValueError("Component not found or access denied")
    
    # Save preview image to bucket
    file_path = save_to_bucket(preview_image, f"components/{component_id}/preview")
    
    # Update component with preview image path
    Component.sql(
        "UPDATE components SET preview_image_path = %(preview_image_path)s, updated_at = %(updated_at)s WHERE id = %(component_id)s",
        {"preview_image_path": file_path, "updated_at": datetime.now(), "component_id": str(component_id)}
    )
    
    return get_component(user, component_id)

@authenticated
def delete_component(user: User, component_id: UUID) -> bool:
    """Delete a custom component."""
    # Verify ownership
    existing = Component.sql(
        "SELECT * FROM components WHERE id = %(component_id)s AND user_id = %(user_id)s",
        {"component_id": str(component_id), "user_id": user.id}
    )
    if not existing:
        raise ValueError("Component not found or access denied")
    
    Component.sql(
        "DELETE FROM components WHERE id = %(component_id)s",
        {"component_id": str(component_id)}
    )
    
    return True

@authenticated
def validate_component_code(user: User, code: str) -> Dict:
    """Validate React component code and return any errors or warnings."""
    try:
        # Basic validation checks
        errors = []
        warnings = []
        
        if not code.strip():
            errors.append("Component code cannot be empty")
            return {"valid": False, "errors": errors, "warnings": warnings}
        
        # Check for basic React component structure
        code_lower = code.lower()
        if "function" not in code_lower and "const" not in code_lower and "export" not in code_lower:
            errors.append("Code must define a React component function")
        
        # Check for return statement or JSX
        if "return" not in code_lower and "=>" not in code_lower:
            warnings.append("Component should return JSX")
        
        # Check for potentially dangerous patterns
        dangerous_patterns = ["eval(", "Function(", "setTimeout(", "setInterval("]
        for pattern in dangerous_patterns:
            if pattern in code:
                warnings.append(f"Potentially unsafe pattern detected: {pattern}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": []
        }

# Global instance
component_service = ComponentService()
