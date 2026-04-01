# Email Configuration & Testing Guide

## 🚀 Quick Setup (Gmail SMTP)

### Step 1: Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
5. Google will generate a **16-character password**
6. Copy it (without spaces): e.g., `abcd efgh ijkl mnop` → `abcdefghijklmnop`

### Step 2: Update .env File

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="jsmith80769@gmail.com"          # Your Gmail address
SMTP_PASS="abcdefghijklmnop"               # 16-char app password (NO SPACES)
SMTP_FROM="AcreCap <jsmith80769@gmail.com>"
FRONTEND_URL="http://localhost:5173"
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## 🧪 Testing Email Delivery

### Test 1: Using Frontend

1. Open http://localhost:5173/forgot-password
2. Enter **jsmith80769@gmail.com** (your test email)
3. Click "Send Reset Link"
4. Check browser console for messages like:
   - ✅ "Reset email sent"
   - ❌ Error messages

### Test 2: Monitor Server Logs

Watch the terminal running `npm run dev` for debug messages:

```
[2026-04-01T10:30:45.123Z] 🔑 [FORGOT-PASSWORD] Request received
[2026-04-01T10:30:45.124Z] 👤 [FORGOT-PASSWORD] Processing for: jsmith80769@gmail.com (audience: user)
[2026-04-01T10:30:45.150Z] ✓ [FORGOT-PASSWORD] User found: John Smith (role: user)
[2026-04-01T10:30:45.200Z] 🔓 [FORGOT-PASSWORD] Issuing password reset token...
[2026-04-01T10:30:45.250Z] 🔗 [FORGOT-PASSWORD] Reset link generated: http://localhost:5173/reset-password?token=...
[2026-04-01T10:30:45.260Z] 📧 [EMAIL] Starting password reset email process for jsmith80769@gmail.com
[2026-04-01T10:30:45.261Z] 📋 [EMAIL] Configuration check:
    - SMTP Host: ✓ Configured
    - SMTP Port: 587
    - SMTP User: ✓ Configured
    - SMTP Pass: ✓ Configured
    - SMTP From: AcreCap <jsmith80769@gmail.com>
    - SMTP Secure: false
    - Webhook URL: ✗ Not set
[2026-04-01T10:30:45.262Z] 🔌 [EMAIL] Using SMTP configuration to send email
[2026-04-01T10:30:45.350Z] 📤 [EMAIL] Attempting to send via SMTP...
[2026-04-01T10:30:45.550Z] ✅ [EMAIL] Email sent successfully! Message ID: <abc123@gmail.com>
[2026-04-01T10:30:45.551Z] ✅ [FORGOT-PASSWORD] Response sent (security: hiding user existence)
```

---

## 🐛 Troubleshooting

### Issue: "Password reset email service is not configured"

- **Cause**: `SMTP_HOST` or `SMTP_FROM` is empty
- **Solution**: Check `.env` file has `SMTP_HOST` and `SMTP_FROM` set

### Issue: "We could not send the reset email right now"

- **Cause**: SMTP credentials are incorrect or Gmail security blocked the connection
- **Solution**:
  1. Verify SMTP_USER is correct (your Gmail address)
  2. Verify SMTP_PASS is the **App Password** (16 chars), not your Gmail password
  3. Make sure 2-Step Verification is enabled on Google Account
  4. Check Gmail security notifications for login attempts

### Issue: Email sent but not received

- **Possible causes**:
  1. Check **Spam/Junk** folder
  2. Wait 1-2 minutes (email delivery takes time)
  3. Check using different email address
  4. Gmail might throttle passwords with spaces

### Issue: "SMTP Error: connect ECONNREFUSED"

- **Cause**: Cannot connect to SMTP server
- **Check**:
  1. Internet connection is working
  2. SMTP_PORT is `587` (not 25, 465)
  3. SMTP_HOST is `smtp.gmail.com`

### Issue: "Invalid login credentials"

- **Cause**: App Password is wrong
- **Solution**:
  1. Delete the old app password from Google
  2. Create a new one
  3. Copy carefully (16 characters, no spaces)

---

## 📊 Log Message Reference

| Symbol | Meaning                         |
| ------ | ------------------------------- |
| 🔑     | Forgot password request started |
| 👤     | User lookup                     |
| ✓      | User found successfully         |
| ℹ️     | Info message                    |
| 🔓     | Password reset token issued     |
| 🔗     | Reset link generated            |
| 📧     | Email sending process           |
| 📋     | Configuration check             |
| ✓      | Configuration verified          |
| ✗      | Configuration missing           |
| 🔌     | Using SMTP                      |
| 📤     | Sending via SMTP                |
| ✅     | Success                         |
| ❌     | Error occurred                  |
| ⚠️     | Warning                         |
| 🔧     | Configuration issue             |
| 🗄️     | Database issue                  |

---

## 🔗 Alternative Email Providers

### Using Office 365 SMTP

```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="AcreCap <your-email@outlook.com>"
```

### Using Webhook (Resend.com)

```env
PASSWORD_RESET_EMAIL_WEBHOOK_URL="https://api.resend.com/emails"
SMTP_USER="resend"
SMTP_PASS="re_xxx..."  # Your Resend API key
```

---

## 📝 Email Template

The password reset email includes:

- ✓ User's name
- ✓ "Reset Password" button (clickable link)
- ✓ Reset link with 30-minute expiry
- ✓ Security warning if not requested
- ✓ AcreCap branding

---

## ✅ Complete Checklist

- [ ] Gmail account has 2-Step Verification enabled
- [ ] App Password generated and copied (16 chars)
- [ ] `.env` file updated with correct credentials
- [ ] `SMTP_PASS` has NO SPACES
- [ ] `FRONTEND_URL` set to your app URL (http://localhost:5173)
- [ ] Server restarted after `.env` changes
- [ ] Test user exists in MongoDB
- [ ] Check server logs for ✅ emoji indicating success
- [ ] Email received in inbox or spam folder

---

## 🚨 Important Security Notes

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **App Password is sensitive** - treat like a password
3. **Frontend won't show user existence** - for security
4. **Reset links expire in 30 minutes**
5. **Each reset request creates a new token** - old ones become invalid

---

## 📞 Need Help?

Check the debug logs:

1. Terminal running `npm run dev` shows detailed logs
2. Browser console (F12) shows frontend errors
3. Each log line has timestamp `[ISO-TIME]` for tracking
