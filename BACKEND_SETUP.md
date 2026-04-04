# Backend Setup Guide

This guide walks you through setting up the PostgreSQL database, Prisma ORM, and API routes for the JumTech backend.

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or cloud-based like Neon, Supabase)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```
DATABASE_URL="postgresql://user:password@localhost:5432/jumtech"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

### 3. Create Database Schema

Run the Prisma migration to create all tables:

```bash
pnpm run prisma:migrate
```

This will:
- Create the `User`, `Service`, and `QuoteRequest` tables
- Set up indexes for performance
- Generate the Prisma client

### 4. Seed Initial Data

Populate the database with the 4 default services:

```bash
pnpm run prisma:seed
```

This adds:
- Ciberseguridad
- Redes
- Desarrollo
- Cámaras

### 5. Start Development Server

```bash
pnpm dev
```

The backend is now running on `http://localhost:3000`

## Database Schema

### User
- `id` - Unique identifier (cuid)
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `role` - ADMIN or CLIENT
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Service
- `id` - Unique identifier (cuid)
- `title` - Service name
- `description` - Service details
- `image` - Optional image URL
- `createdAt` - Service creation timestamp
- `updatedAt` - Last update timestamp

### QuoteRequest
- `id` - Unique identifier (cuid)
- `name` - Client name
- `email` - Client email
- `phone` - Client phone number
- `message` - Quote request message
- `serviceId` - Foreign key to Service
- `createdAt` - Request timestamp

## API Endpoints

### Services

#### GET /api/services
Get all available services

**Response:**
```json
[
  {
    "id": "clx...",
    "title": "Ciberseguridad",
    "description": "Protección avanzada...",
    "image": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/services
Create a new service (admin only)

**Request:**
```json
{
  "title": "Service Name",
  "description": "Service description",
  "image": "https://example.com/image.jpg"
}
```

### Quote Requests

#### GET /api/quotes
Get all quote requests (admin only)

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+34123456789",
    "message": "I need a security audit",
    "serviceId": "clx...",
    "service": { /* Service object */ },
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/quotes
Submit a new quote request

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+34123456789",
  "message": "I need a security audit",
  "serviceId": "clx..."
}
```

**Validation:**
- All fields required
- Email must be valid format
- Phone must be at least 7 characters
- ServiceId must exist in database

### Authentication

#### POST /api/auth/register
Create a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Validation:**
- Email must be unique and valid
- Password must be at least 6 characters
- Returns error if user already exists

**Response:**
```json
{
  "id": "clx...",
  "email": "user@example.com",
  "role": "CLIENT",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### POST /api/auth/login
Authenticate user and receive session token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "role": "CLIENT",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Login successful"
}
```

## File Structure

```
/prisma
  /schema.prisma       - Database models
  /seed.js             - Initial data seeding
/lib
  /prisma.ts          - Prisma client singleton
  /auth.ts            - Authentication utilities
/app/api
  /services/route.ts  - Services endpoints
  /quotes/route.ts    - Quote requests endpoints
  /auth
    /login/route.ts   - Login endpoint
    /register/route.ts - Registration endpoint
```

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- API validates all input before processing
- Sensitive data (passwords) never exposed in responses
- Database uses indexes for performance
- Foreign key constraints prevent orphaned data

## Next Steps

1. **Session Management**: Implement JWT or session cookies for authenticated requests
2. **Admin Authorization**: Add role-based middleware for admin endpoints
3. **Error Handling**: Enhance with more detailed error messages
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Email Notifications**: Send confirmation emails for new quote requests
6. **Testing**: Write integration tests for all endpoints

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure database exists

### Prisma Client Error
```bash
pnpm add -D @prisma/client
pnpm run prisma:migrate
```

### Port Already in Use
```bash
pnpm dev -p 3001  # Use different port
```

## Production Deployment

Before deploying to production:

1. Set `DATABASE_URL` to production database
2. Run migrations on production database
3. Set `NODE_ENV=production`
4. Enable CORS if frontend is on different domain
5. Implement proper authentication/authorization
6. Add rate limiting and security headers
7. Set up monitoring and logging
