# Security & Backend Architecture

## Overview

This document describes the security measures and backend improvements implemented in the API.

---

## Authentication & Authorization

### Password Security
- Passwords are hashed using **bcryptjs** with 10 salt rounds (industry standard)
- Passwords are NEVER returned in API responses
- Password validation requires minimum 6 characters

### JWT Token Authentication
- Login generates a **JWT token** valid for 7 days
- Token contains user ID and role (ADMIN/CLIENT)
- Token is signed with `JWT_SECRET` environment variable
- All protected routes require valid Bearer token in Authorization header

**Token Usage:**
```
Authorization: Bearer <your-jwt-token>
```

### Admin Protection
- Admin routes require valid JWT token AND ADMIN role
- Non-admin or missing tokens receive 401/403 responses
- Protected routes:
  - `POST /api/services` - Create service
  - `PUT /api/services` - Update service
  - `DELETE /api/services` - Delete service
  - `GET /api/quotes` - View all quote requests

---

## Route Protection

### Public Routes
- `GET /api/services` - List all services (no auth required)
- `POST /api/quotes` - Submit quote request (no auth required)
- `POST /api/auth/register` - Register new user (no auth required)
- `POST /api/auth/login` - Login (no auth required, returns token)

### Admin-Only Routes
- `POST /api/services` - Create service
- `PUT /api/services` - Update service
- `DELETE /api/services?id=<id>` - Delete service
- `GET /api/quotes` - Get all quote requests

---

## Input Validation & Sanitization

### Email Validation
- Regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Converted to lowercase before processing
- Trimmed of whitespace

### Password Validation
- Minimum 6 characters required
- No additional complexity requirements (kept simple for admin system)

### String Sanitization
- All text inputs trimmed
- Maximum 1000 characters per field
- Protects against extremely long inputs

### Phone Number Validation
- Minimum 7 characters
- Maximum 20 characters
- Standard international format support

### Type Checking
- All endpoints validate input types (string, not array, object, etc.)
- Prevents type confusion attacks

---

## Data Protection

### Sensitive Data Handling
- **Never return passwords** in any API response
- User objects use destructuring to exclude passwords: `const { password: _, ...user } = dbUser`
- Quote requests don't store sensitive user passwords

### SQL Injection Prevention
- Prisma ORM provides parameterized queries by default
- No raw SQL queries used

### Error Handling
- Generic error messages to prevent information disclosure
- Example: "Invalid email or password" (not "email not found")
- Server errors logged but not exposed to clients

---

## Environment Variables

Required variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secure-secret-key-min-32-chars
```

**JWT_SECRET:** Should be a strong random string (minimum 32 characters recommended). Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## API Response Format

### Success (2xx)
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "role": "ADMIN",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Error (4xx/5xx)
```json
{
  "error": "Invalid email or password"
}
```

---

## Best Practices

### For Frontend
1. Store token securely (httpOnly cookie recommended)
2. Include token in every admin request: `Authorization: Bearer <token>`
3. Validate email format before sending to API
4. Show user-friendly error messages

### For Deployment
1. Use strong JWT_SECRET (minimum 32 characters, random)
2. Enable HTTPS/TLS for all requests
3. Set secure CORS headers if using separate domains
4. Monitor API logs for suspicious activity
5. Regular security updates for Node.js, Next.js, and dependencies

### Rate Limiting (Recommended)
Consider adding rate limiting middleware to prevent brute force attacks on login/register routes.

---

## Testing

### Login Flow
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use returned token for admin requests
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Service","description":"Description"}'
```

---

## Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT token authentication
- [x] Admin role-based access control
- [x] Route protection middleware
- [x] Input validation and sanitization
- [x] Type checking
- [x] Error handling without data exposure
- [x] No passwords in responses
- [x] Parameterized queries (Prisma)
- [ ] HTTPS/TLS (deploy with HTTPS)
- [ ] Rate limiting (optional add-on)
- [ ] CORS headers (if needed)
- [ ] API monitoring/logging (optional)
