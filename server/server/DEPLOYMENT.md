# Legal Diary — Deployment Guide

## 1. Server Setup

### Environment Variables
Edit `.env` before starting:
```
MONGO_URI=<your MongoDB Atlas URI>
PORT=5000
JWT_SECRET=<keep the strong key already set — do NOT change>
EMAIL_USER=<your Gmail address>
EMAIL_PASS=<your Gmail App Password>
CLIENT_URL=https://your-frontend-domain.com
```

### Install & Start
```bash
npm install
npm start          # production
npm run dev        # development (nodemon)
```

### Uploads Folder
The `uploads/` folder must exist and be writable:
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## 2. Client Setup

### Environment Variables
Edit `client/.env.production`:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### Build for Production
```bash
npm install
npm run build
# Serve the dist/ folder with Nginx or any static host
```

---

## 3. What Was Fixed for Production

| # | Issue | Fix Applied |
|---|-------|-------------|
| 1 | Anyone could register as admin | Role is now always "lawyer" on server — cannot be changed from frontend |
| 2 | Weak JWT secret | Replaced with 96-character cryptographic random key |
| 3 | CORS wide open | Now restricted to CLIENT_URL env variable |
| 4 | Timeline route unprotected | `protect` middleware added |
| 5 | Client routes unprotected | `protect` + `lawyerOnly` added |
| 6 | No file type/size validation | Only PDF/DOC/DOCX/JPG/PNG/WEBP, max 10MB |
| 7 | Hardcoded localhost in DiaryPage | Uses VITE_API_URL env variable |
| 8 | Hardcoded localhost in api.js | Uses VITE_API_URL env variable |
| 9 | dotenv loaded too late | Moved to first line of server.js |
| 10 | Delete client left orphan data | Cascade deletes all cases, notes, docs, outcomes |
| 11 | Delete case left orphan data | Cascade deletes all child records |
| 12 | 401 token expiry not handled | Auto-redirects to /login |
| 13 | OTP emails plain text | HTML email template applied |
| 14 | AdminSettings was static | Now shows real system info |
| 15 | Precedent model dead code | Deleted |
| 16 | Global error handler missing | Added to server.js |
| 17 | bcrypt salt rounds were 10 | Increased to 12 |
| 18 | isActive not checked on login | Blocked users now correctly rejected |
