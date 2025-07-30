# Solar Website Builder

A full-stack drag-and-drop CMS with React frontend and Python FastAPI backend.

## 🚀 One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/solar-website-builder?referralCode=solar)

## Features

- **Drag & Drop Builder**: Visual website creation
- **Component Library**: Reusable React components  
- **Media Management**: File upload and asset management
- **Authentication**: JWT-based auth with OAuth2
- **Security Hardened**: CORS protection, input validation, rate limiting

## Architecture

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + Uvicorn
- **Deployment**: Docker + Nginx reverse proxy
- **Security**: Environment-based configuration, JWT validation

## Environment Variables

Required for deployment:

```bash
ENV=deployment
PUBLIC_DOMAIN=your-domain.com
JWT_SECRET=your-secure-jwt-secret
ROUTER_BASE_URL=https://your-auth-server.com
PORT=8000
WORKERS=4
LOG_LEVEL=warning
```

## Local Development

1. **Frontend** (port 3000):
   ```bash
   cd app
   npm install
   npm run dev
   ```

2. **Backend** (port 8000):
   ```bash
   cd services
   python -m venv venv
   source venv/bin/activate
   pip install -e .
   python main.py
   ```

## Security Features

✅ **CORS Protection**: Environment-based origin validation  
✅ **JWT Security**: Proper signature verification  
✅ **Error Handling**: Secure error responses with debug IDs  
✅ **Input Validation**: React component code validation  
✅ **Rate Limiting**: Auth endpoint protection  
✅ **File Upload Security**: Comprehensive file validation  

## API Documentation

Once deployed, visit `/docs` for interactive API documentation powered by FastAPI.

## Support

Report issues at: https://github.com/mikeschlottig/solar-website-builder/issues