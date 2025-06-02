#!/bin/bash

# Quick test script to verify Firebase App Check is working
# Run this after making the configuration changes

echo "🧪 Testing Firebase App Check Configuration"
echo "=========================================="

# Test 1: Check if the site is accessible
echo "1. Testing site accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://grainguardgix.netlify.app | grep -q "200"; then
    echo "✅ Site is accessible"
else
    echo "❌ Site is not accessible"
fi

# Test 2: Check if ReCAPTCHA Enterprise script loads
echo "2. Testing ReCAPTCHA Enterprise script..."
if curl -s https://grainguardgix.netlify.app | grep -q "recaptcha/enterprise.js"; then
    echo "✅ ReCAPTCHA Enterprise script is included"
else
    echo "❌ ReCAPTCHA Enterprise script not found"
fi

# Test 3: Check if the correct site key is being used
echo "3. Testing site key configuration..."
if curl -s https://grainguardgix.netlify.app | grep -q "6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC"; then
    echo "✅ Correct site key found in HTML"
else
    echo "❌ Site key not found or incorrect"
fi

# Test 4: Test ReCAPTCHA Enterprise API endpoint
echo "4. Testing ReCAPTCHA Enterprise API accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/recaptcha/enterprise.js?render=6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC" | grep -q "200"; then
    echo "✅ ReCAPTCHA Enterprise API is accessible"
else
    echo "❌ ReCAPTCHA Enterprise API is not accessible"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open https://grainguardgix.netlify.app in your browser"
echo "2. Open DevTools Console"
echo "3. Run the diagnostic script from diagnose-firebase-issues.js"
echo "4. Look for any 400/401 errors in the Network tab"
echo ""
echo "If you see 400 errors, follow the FIX_400_ERROR_GUIDE.md steps."
