# Authentication Implementation Plan

## Project Analysis Summary

After analyzing the full project structure, I understand this is a **multi-hotel booking management platform** with:

- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 15 with React 19
- **Authentication**: Supabase configuration available
- **User Roles**: OWNER and STAFF (already defined in Prisma schema)
- **Current State**: Login UI exists but no backend authentication

## Implementation Steps

### Step 1: Create Authentication API Routes ✅ COMPLETED
**Objective**: Set up Next.js API routes for authentication

**Files created/modified**:
- ✅ `src/app/api/auth/login/route.ts` - Login endpoint
- ✅ `src/app/api/auth/logout/route.ts` - Logout endpoint
- ✅ `src/app/api/auth/me/route.ts` - Get current user endpoint
- ✅ `src/lib/auth.ts` - Authentication utilities
- ✅ `src/lib/jwt.ts` - JWT token management

**Tasks Completed**:
1. ✅ Create JWT utility functions for token generation/verification
2. ✅ Implement login API route with username/password validation
3. ✅ Implement logout API route
4. ✅ Implement user profile endpoint
5. ✅ Add password hashing verification using bcryptjs

**Validation**: ✅ API endpoints created and ready for testing

---

### Step 2: Create Authentication Context
**Objective**: Set up React context for authentication state management

**Files to create/modify**:
- `src/contexts/AuthContext.tsx` - Authentication context provider
- `src/hooks/useAuth.ts` - Custom hook for authentication

**Tasks**:
1. Create AuthContext with user state, login, logout functions
2. Implement token storage in localStorage/cookies
3. Add automatic token refresh logic
4. Create useAuth hook for easy access to auth state

**Validation**: Verify context provides correct authentication state

---

### Step 3: Implement Authentication Logic in Login Page
**Objective**: Connect existing login UI to authentication API

**Files to modify**:
- `src/app/page.tsx` - Update login form to call API

**Tasks**:
1. Update handleLogin function to call authentication API
2. Add loading states and error handling
3. Redirect to dashboard after successful login
4. Add form validation
5. Handle authentication errors gracefully

**Validation**: Test login with valid/invalid credentials

---

### Step 4: Create Protected Route Component
**Objective**: Implement route protection for authenticated users

**Files to create**:
- `src/components/ProtectedRoute.tsx` - Route protection wrapper
- `src/components/RoleGuard.tsx` - Role-based access control

**Tasks**:
1. Create ProtectedRoute component that checks authentication
2. Implement role-based access control (OWNER vs STAFF)
3. Add loading states while checking authentication
4. Redirect to login if not authenticated

**Validation**: Test route protection with authenticated/unauthenticated users

---

### Step 5: Update Layout Components for Authentication
**Objective**: Integrate authentication into the application layout

**Files to modify**:
- `src/app/layout.tsx` - Wrap with AuthProvider
- `src/components/LayoutWrapper.tsx` - Add authentication checks
- `src/components/Sidebar.tsx` - Update logout functionality

**Tasks**:
1. Wrap RootLayout with AuthProvider
2. Update LayoutWrapper to show/hide based on authentication
3. Implement functional logout in Sidebar
4. Add user information display in header
5. Handle authentication state changes

**Validation**: Test layout behavior with different authentication states

---

### Step 6: Implement Route Protection
**Objective**: Protect all authenticated routes

**Files to modify**:
- `src/app/(owner)/addhotel/page.tsx` - Add OWNER role protection
- `src/app/(owner)/addroom/page.tsx` - Add OWNER role protection
- `src/app/booking/page.tsx` - Add STAFF/OWNER protection
- `src/app/guests/page.tsx` - Add STAFF/OWNER protection
- `src/app/reservations/page.tsx` - Add STAFF/OWNER protection

**Tasks**:
1. Wrap owner pages with OWNER role guard
2. Wrap staff pages with STAFF/OWNER role guard
3. Add loading states for authentication checks
4. Handle unauthorized access gracefully

**Validation**: Test role-based access with different user types

---

### Step 7: Add Staff Management for Owner
**Objective**: Allow owners to manage staff accounts

**Files to create**:
- `src/app/(owner)/staff/page.tsx` - Staff management page
- `src/app/api/staff/route.ts` - Staff CRUD API

**Tasks**:
1. Create staff management interface for owners
2. Implement API endpoints for staff CRUD operations
3. Add staff creation form with role assignment
4. Add staff activation/deactivation functionality
5. Update sidebar navigation for owners

**Validation**: Test staff management functionality as owner

---

### Step 8: Update Database Seeds
**Objective**: Update seed data to reflect authentication requirements

**Files to modify**:
- `prisma/seed.js` - Update user seeds with proper authentication data

**Tasks**:
1. Add more realistic user accounts for testing
2. Ensure proper password hashing in seeds
3. Add different user roles for comprehensive testing
4. Update related data to reference correct user IDs

**Validation**: Run seed script and verify user accounts work

---

### Step 9: Add Middleware for API Protection
**Objective**: Protect API routes with authentication middleware

**Files to create**:
- `src/middleware.ts` - Next.js middleware for route protection
- `src/lib/middleware-auth.ts` - Authentication middleware utilities

**Tasks**:
1. Create middleware to protect API routes
2. Add JWT token validation for API calls
3. Implement role-based API access control
4. Add proper error responses for unauthorized requests

**Validation**: Test API protection with authenticated/unauthenticated requests

---

### Step 10: Final Testing and Error Handling
**Objective**: Comprehensive testing and error handling

**Tasks**:
1. Test complete authentication flow
2. Test role-based access control
3. Test token expiration and refresh
4. Test error scenarios (network errors, invalid tokens, etc.)
5. Add proper loading states throughout the application
6. Test logout functionality
7. Test staff management by owner
8. Verify all protected routes work correctly

**Validation**: Complete end-to-end testing of authentication system

---

## Technical Implementation Details

### Authentication Flow
1. User enters credentials on login page
2. Frontend calls `/api/auth/login` with credentials
3. Backend validates credentials against database
4. If valid, generate JWT token and return to frontend
5. Frontend stores token and updates authentication state
6. Protected routes check authentication state before rendering
7. API calls include JWT token in Authorization header
8. Middleware validates token for protected API routes

### Security Considerations
1. Passwords hashed with bcryptjs (already implemented in seeds)
2. JWT tokens with reasonable expiration time
3. Secure token storage (httpOnly cookies recommended)
4. Role-based access control for different user types
5. API route protection with middleware
6. Input validation and sanitization

### Database Schema
The existing Prisma schema already includes:
- User model with username, email, password, role
- UserRole enum with OWNER and STAFF
- Proper relationships for user-created entities

### Environment Variables
Existing Supabase configuration will be used for:
- Database connection (already configured)
- JWT secret for token signing

## Success Criteria

✅ **Authentication System**:
- Users can log in with username/password
- JWT tokens are properly generated and validated
- Authentication state is managed globally
- Logout functionality works correctly

✅ **Route Protection**:
- Unauthenticated users redirected to login
- Role-based access control implemented
- Owner-only pages protected from staff access
- API routes protected with middleware

✅ **User Management**:
- Owners can create/manage staff accounts
- User roles properly enforced
- Staff accounts can be activated/deactivated

✅ **Error Handling**:
- Graceful handling of authentication errors
- Proper loading states during authentication
- Clear error messages for users

✅ **Security**:
- Passwords properly hashed
- JWT tokens securely managed
- API routes protected from unauthorized access

## Notes

- Each step must be completed and tested before proceeding to the next
- Code must be reviewed after each step to ensure no errors
- All authentication logic should be simple but secure
- The existing UI design should be preserved
- No new pages should be created except for staff management
- The existing `src/app/page.tsx` will serve as the sign-in page

## Post-Implementation

After completing all steps:
1. Update this document with "COMPLETED" status for each step
2. Document any issues encountered and their solutions
3. Provide final testing checklist
4. Update project README with authentication information