import uvicorn
import os

if __name__ == "__main__":
    # Security patch: Environment-based configuration
    env = os.getenv("ENV", "deployment")
    is_production = env == "deployment"
    
    uvicorn.run(
        "api.bootstrap:app",
        host="127.0.0.1" if is_production else "0.0.0.0",  # Bind to localhost in production
        port=int(os.getenv("PORT", 8000)),
        reload=not is_production,  # Disable reload in production
        workers=int(os.getenv("WORKERS", 4)) if is_production else 1,
        log_level=os.getenv("LOG_LEVEL", "info"),
        access_log=not is_production,  # Disable access logs in production for performance
    )
