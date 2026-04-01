#!/bin/bash
# Quick Email Setup Test Script
# Run this to test all components of email delivery

echo "🔍 AcreCap Email Configuration Test"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Extract values from .env
SMTP_HOST=$(grep "SMTP_HOST=" .env | cut -d'"' -f2)
SMTP_PORT=$(grep "SMTP_PORT=" .env | cut -d'"' -f2)
SMTP_USER=$(grep "SMTP_USER=" .env | cut -d'"' -f2)
SMTP_PASS=$(grep "SMTP_PASS=" .env | cut -d'"' -f2)
SMTP_FROM=$(grep "SMTP_FROM=" .env | cut -d'"' -f2)
FRONTEND_URL=$(grep "FRONTEND_URL=" .env | cut -d'"' -f2)

echo "📋 Loaded Configuration:"
echo "  SMTP_HOST: $SMTP_HOST"
echo "  SMTP_PORT: $SMTP_PORT"
echo "  SMTP_USER: ${SMTP_USER:0:10}...${SMTP_USER: -10}"
echo "  SMTP_PASS: ${SMTP_PASS:0:5}...${SMTP_PASS: -5}"
echo "  SMTP_FROM: $SMTP_FROM"
echo "  FRONTEND_URL: $FRONTEND_URL"
echo ""

# Test DNS resolution
echo "🌐 Testing DNS resolution..."
if nslookup "$SMTP_HOST" &>/dev/null; then
    echo "✅ DNS resolved for $SMTP_HOST"
else
    echo "❌ Cannot resolve $SMTP_HOST"
    exit 1
fi
echo ""

# Check if node_modules has nodemailer
if [ -d "node_modules/nodemailer" ]; then
    echo "✅ nodemailer package installed"
else
    echo "❌ nodemailer not installed. Run: npm install"
    exit 1
fi
echo ""

# Check MongoDB connection
echo "📦 Checking MongoDB..."
MONGODB_URI=$(grep "MONGODB_URI=" .env | cut -d'"' -f2)
if [[ ! -z "$MONGODB_URI" ]]; then
    echo "✅ MONGODB_URI configured"
else
    echo "❌ MONGODB_URI not found"
    exit 1
fi
echo ""

echo "✅ All basic checks passed!"
echo ""
echo "Next steps:"
echo "1. Start server: npm run dev"
echo "2. Go to: http://localhost:5173/forgot-password"
echo "3. Enter email: $SMTP_USER"
echo "4. Check server logs for [EMAIL] messages"
echo "5. Check inbox for password reset email"
