#!/bin/bash

# ReCAPTCHA Enterprise Test Script
# This script helps test ReCAPTCHA Enterprise functionality manually

echo "=== ReCAPTCHA Enterprise Test ==="
echo "Site Key: 6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC"
echo "Domain: grainguardgix.netlify.app"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed."
    exit 1
fi

echo "1. Testing ReCAPTCHA Enterprise API endpoint..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
    "https://www.google.com/recaptcha/enterprise.js?render=6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC"

echo ""
echo "2. To test with actual token:"
echo "   - Open browser console on grainguardgix.netlify.app"
echo "   - Run: grecaptcha.enterprise.ready(() => {"
echo "     grecaptcha.enterprise.execute('6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC', {"
echo "       action: 'firebase_app_check'"
echo "     }).then(token => {"
echo "       console.log('Token:', token);"
echo "       // Use this token in request.json"
echo "     });"
echo "   });"

echo ""
echo "3. Expected Firebase Console configuration:"
echo "   - ReCAPTCHA site key registered in Firebase App Check"
echo "   - Domain grainguardgix.netlify.app authorized in ReCAPTCHA Enterprise"
echo "   - OAuth domains include grainguardgix.netlify.app"

echo ""
echo "4. Common error fixes:"
echo "   - 401/403 errors: Check domain authorization in Google Cloud Console"
echo "   - App Check token failures: Verify site key matches in Firebase Console"
echo "   - Authentication failures: Check Firebase Auth authorized domains"
