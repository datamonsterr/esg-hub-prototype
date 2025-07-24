# Organization Guard & Admin Features

This implementation provides organization-based access control and admin user management for the ESG Hub application.

## Features Implemented

### 1. Organization Guard System

- **Location**: `src/components/organization-guard.tsx`
- **Purpose**: Ensures users are part of an organization before accessing the app
- **Behavior**:
  - Checks Clerk user metadata for `organizationId`
  - Redirects to onboarding if no organization
  - Shows helpful message with next steps

### 2. Auto-Invite System

- **Admin User**: `dat.pham@nuoa.io` (Admin of Nuoa.io organization)
- **Auto-invite**: All new users automatically get invited to Nuoa.io for testing
- **API**: `/api/onboard/pending-invitations` (POST) creates auto-invites

### 3. Admin Dashboard

- **Location**: `/admin` page
- **Access**: Admin users only (checked via `organizationRole` in Clerk metadata)
- **Features**:
  - User management table with active members
  - Pending invitations management
  - Invite new users
  - Change user roles (admin/employee)
  - Remove users from organization

### 4. API Routes Created

- `/api/users` - User CRUD operations
- `/api/users/[id]` - Individual user management
- `/api/organizations/[id]/members` - Organization member management
- `/api/organizations/[id]/members/[memberId]` - Individual member management
- `/api/invites` - Invitation management
- `/api/onboard/pending-invitations` - Auto-invite system

### 5. Database Updates

- Added `org-nuoa` organization (Nuoa.io)
- Added `users` collection
- Added `organization-members` collection
- Added `invites` collection
- Pre-configured admin user: `dat.pham@nuoa.io`

## How It Works

### For New Users:

1. User signs up with Clerk
2. Organization Guard detects no `organizationId` in metadata
3. User is redirected to `/onboarding`
4. Onboarding page auto-creates invitation to Nuoa.io
5. User accepts invitation
6. Clerk metadata is updated with organization info
7. User can now access the application

### For Admin Users:

1. Admin users see "Admin" button in navbar
2. Admin dashboard allows:
   - Viewing all organization members
   - Managing user roles
   - Sending invitations
   - Canceling pending invitations
   - Removing users

### Database Structure:

```json
{
  "organizations": [
    {
      "id": "org-nuoa",
      "name": "Nuoa.io",
      "type": "platform",
      "contactEmail": "contact@nuoa.io"
    }
  ],
  "users": [
    {
      "id": "user-admin-001",
      "email": "dat.pham@nuoa.io",
      "organizationId": "org-nuoa",
      "organizationRole": "admin"
    }
  ],
  "organization-members": [
    {
      "id": "member-001",
      "userId": "user-admin-001",
      "organizationId": "org-nuoa",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

## Testing the Implementation

1. **Sign up as a new user**:

   - Any email will work
   - You'll be redirected to onboarding
   - Accept the auto-generated Nuoa.io invitation

2. **Test admin features**:

   - Sign in as `dat.pham@nuoa.io` (if Clerk allows)
   - Or update any user's metadata to have `organizationRole: "admin"`
   - Navigate to `/admin` to access admin dashboard

3. **Test organization guard**:
   - Create a user without `organizationId` in metadata
   - Try to access main pages - should be redirected to onboarding

## Environment Variables Required

Make sure Clerk is properly configured with these metadata fields in user profiles:

- `organizationId` (string)
- `organizationRole` ("admin" | "employee")

## Key Files Modified/Created

- `src/components/organization-guard.tsx` - Main guard component
- `src/components/conditional-organization-guard.tsx` - Conditional wrapper
- `src/components/admin/` - Admin dashboard components
- `src/app/admin/page.tsx` - Admin page
- `src/app/onboarding/page.tsx` - Updated onboarding with auto-invite
- `src/app/layout.tsx` - Added organization guard
- `src/components/navbar.tsx` - Added admin button
- Multiple API routes for user/organization management
- `data/db.json` - Updated with new collections and data

This implementation provides a complete organization-based access control system with admin capabilities for user management.
