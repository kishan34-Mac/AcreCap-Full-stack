# 🔐 Admin Login Fix - Complete Guide

## ✅ What Was Fixed

### Issue 1: Invalid Password Length

- **Problem**: Password "9090" was only 4 characters
- **Requirement**: Minimum 6 characters
- **Solution**: Updated to `AcreCap@Admin123` (14 characters) ✅

### Issue 2: Admin Account Doesn't Exist

- **Problem**: Admin email is reserved but account wasn't in database
- **Solution**: Created initialization script

---

## 🚀 Setup Steps (Choose One)

### **Option A: Automatic Setup (Recommended)**

Run the initialization script to create/update the admin account:

```bash
npx tsx scripts/initialize-admin.ts
```

**Expected Output:**

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
🔄 Creating new admin account...
✅ Admin account created successfully

📋 Admin Account Details:
   Email: acrecap.Loan@gmail.com
   Name: Admin
   Role: admin

🎉 Admin initialization complete!
👉 You can now login at: /admin-login
```

### **Option B: Manual Database Setup**

If you prefer to create the account manually via MongoDB:

1. Open MongoDB Compass or your database tool
2. Connect to your database: `acrecap`
3. Collection: `users`
4. Insert a new document:

```json
{
  "name": "Admin",
  "email": "acrecap.loan@gmail.com",
  "phone": "",
  "passwordHash": "$2a$10$...",  // bcrypt hash of "AcreCap@Admin123"
  "role": "admin",
  "resetPasswordTokenHash": null,
  "resetPasswordExpiresAt": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

To generate the bcrypt hash, send a request to your server with password reset for that email, or use:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('AcreCap@Admin123', 10).then(h => console.log(h))"
```

---

## 🧪 Test Admin Login

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Visit Admin Login Page

```
http://localhost:5173/admin-login
```

### Step 3: Enter Credentials

- **Email**: `acrecap.Loan@gmail.com`
- **Password**: `AcreCap@Admin123`

### Step 4: Click Login

**Expected Result**: ✅ Redirects to `/admin` dashboard

---

## ❌ Common Errors & Fixes

### Error: "Invalid admin email or password"

- ✅ Check email is lowercase: `acrecap.loan@gmail.com`
- ✅ Check password exactly: `AcreCap@Admin123` (case-sensitive!)
- ✅ Verify admin account exists in database

### Error: "validation_error"

- ✅ Password must be at least 6 characters
- ✅ Email must be valid format
- ✅ Check no extra spaces in input

### Error: "Admin account not found"

- ✅ Run the initialization script: `npx tsx scripts/initialize-admin.ts`
- ✅ Ensure MongoDB is connected
- ✅ Check `ADMIN_EMAIL` in `.env` matches the email you're trying to login with

### Error: "Database connection failed"

- ✅ Verify `MONGODB_URI` in `.env` is correct
- ✅ Check internet connection
- ✅ Verify MongoDB Atlas IP whitelist includes your machine

---

## 📋 Updated Environment Settings

Your `.env` now has:

```env
ADMIN_EMAIL="acrecap.Loan@gmail.com"
ADMIN_PASSWORD="AcreCap@Admin123"    # ✅ 14 characters (was 4)
ADMIN_NAME="Admin"
```

⚠️ **Security Note**: This is a temporary password. After first login, you should:

1. Go to Admin Settings
2. Change password to something unique
3. Store it securely

---

## 🔑 Change Password After Login

1. Login to `/admin-login` with temporary credentials
2. Go to Admin Settings/Profile
3. Change password to something secure
4. Update `.env` file with new password for team reference

---

## 🆘 Still Having Issues?

### Check Logs

```bash
# Terminal 1: Start server with verbose logging
npm run dev
```

Look for messages like:

```
[TIME] ✅ Auth: Admin login attempt for acrecap.loan@gmail.com
[TIME] ✅ Auth: Admin account verified
```

### Debug Database

```bash
# Check if admin exists
db.users.findOne({ email: "acrecap.loan@gmail.com" })

# Check admin's password hash exists
db.users.find({ role: "admin" }).pretty()
```

### Run Script with Verbose Output

```bash
npx tsx scripts/initialize-admin.ts --verbose
```

---

## ✨ Next Steps

After successful admin login:

1. ✅ Explore the Admin Dashboard
2. ✅ View user submissions
3. ✅ Add more admins if needed (Admin Users page)
4. ✅ Configure email settings for notifications
5. ✅ Review activity logs

---

## 📞 Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review server console logs for error messages
3. Verify all `.env` variables are set correctly
4. Ensure MongoDB connection is stable
5. Try running the initialization script again

---

**Updated**: 1 April 2026
**Status**: ✅ Ready for admin login
