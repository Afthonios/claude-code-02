# Authentication System Testing Checklist

## ✅ Authentication Flow
- [ ] Demo user login works
- [ ] Demo admin login works  
- [ ] Directus user login works
- [ ] User registration creates new user
- [ ] Session persists after page reload
- [ ] Logout clears session properly

## ✅ Role-based Access Control
- [ ] Authenticated users can access `/profile`
- [ ] Unauthenticated users redirected from protected routes
- [ ] B2B members can access `/b2b/workspace`
- [ ] Non-B2B users blocked from B2B routes
- [ ] Admins can access `/admin`
- [ ] Non-admins blocked from admin routes

## ✅ API Endpoints
- [ ] `POST /api/auth/register` creates users successfully
- [ ] Registration validates input properly
- [ ] Registration prevents duplicate emails
- [ ] `POST /api/auth/invite` works for B2B admins
- [ ] `GET /api/users/[userId]/role` returns user info
- [ ] `PUT /api/users/[userId]/role` updates roles (admin only)

## ✅ Role Hierarchy
- [ ] `hasRoleOrHigher()` respects role hierarchy
- [ ] B2B admins can access member features
- [ ] Customers can access authenticated features
- [ ] Role upgrades work properly
- [ ] Role downgrades prevented appropriately

## ✅ Security
- [ ] Cannot access other users' data
- [ ] Cannot escalate privileges
- [ ] Cannot update own role (non-admin)
- [ ] JWT tokens contain proper role info
- [ ] API endpoints validate permissions

## ✅ User Experience  
- [ ] Error messages are clear
- [ ] Loading states work properly
- [ ] Forms validate input
- [ ] Navigation reflects user permissions
- [ ] Internationalization works (FR/EN)

## 🧪 Test Cases to Try

### Registration Test Cases
```bash
# Valid registration
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "acceptTerms": true
  }'

# Invalid registration (missing data)
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "email": "invalid-email",
    "password": "123"
  }'
```

### Authentication Test Cases
```bash
# Login endpoint check
curl http://localhost:3002/api/auth/signin

# Session check  
curl http://localhost:3002/api/auth/session
```

## 🔍 What to Look For

### Success Indicators
- ✅ Users can register and login
- ✅ Roles are assigned correctly
- ✅ Protected routes block unauthorized access
- ✅ API responses match expected format
- ✅ No console errors in browser
- ✅ Database records created properly

### Failure Indicators  
- ❌ 500 errors on registration/login
- ❌ Users stuck in loading state
- ❌ Protected routes accessible without auth
- ❌ Role permissions not working
- ❌ API returning malformed responses
- ❌ Database connection issues

## 🐛 Common Issues & Solutions

### "Cannot connect to Directus"
- Check `NEXT_PUBLIC_DIRECTUS_URL` in `.env.local`
- Verify Directus server is running
- Check network connectivity

### "Role not found" errors
- Verify role IDs in `.env.local` match Directus
- Check role permissions in Directus admin
- Ensure default role is set

### "Authentication failed"
- Check admin credentials in `.env.local`
- Verify user exists in Directus
- Check password requirements

### Middleware redirect loops
- Check route configuration in `middleware.ts`
- Verify locale handling
- Test with different browsers/incognito