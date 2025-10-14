# Authentication Setup Guide

## Overview
The authentication system now uses a proper admin role tracking system with a dedicated `users` table in Supabase.

## Database Schema

### Users Table
- **id**: UUID (references auth.users)
- **email**: TEXT (unique)
- **role**: TEXT ('user' or 'admin')
- **created_at**: TIMESTAMPTZ
- **updated_at**: TIMESTAMPTZ

### Automatic User Creation
When a user signs up via magic link, a trigger automatically creates a record in the `users` table with role='user'.

## Admin Management

### Making a User an Admin
To grant admin access to a user, run this SQL in your Supabase SQL Editor:

```sql
UPDATE public.users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'user@example.com';
```

### Checking Admin Status
```sql
SELECT email, role FROM public.users WHERE role = 'admin';
```

### Removing Admin Access
```sql
UPDATE public.users 
SET role = 'user', updated_at = NOW()
WHERE email = 'user@example.com';
```

## Supabase Configuration

### Required Redirect URLs
In your Supabase Dashboard → Authentication → URL Configuration, add:

**Redirect URLs:**
- `http://localhost:3000/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)

**Site URL:**
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

## Authentication Flow

1. User enters email on `/login` page
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Callback route:
   - Exchanges code for session
   - Checks `users` table for admin role
   - If admin: redirects to `/modify`
   - If not admin: signs out and redirects to `/login` with error
5. Middleware protects `/modify` route by checking session and admin role

## Current Admin Users

Your email (jamiulislamjami@hotmail.com) has been set as an admin.

## Security Features

- Row Level Security (RLS) enabled on users table
- Users can only read their own data
- Only admins can read all users
- Only admins can update user roles
- Automatic user record creation on signup
- Session validation on protected routes
- Admin role verification from database (not client-side metadata)

## Testing

1. Go to `http://localhost:3000/login`
2. Enter your admin email
3. Check your email for the magic link
4. Click the link
5. You should be redirected to `/modify` page

If you're not an admin, you'll see: "Only admins can access the page"
