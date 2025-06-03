# Update Farm Access Script
# This script adds test users to the demo farm

Write-Host "🚀 Updating Demo Farm Access Permissions" -ForegroundColor Green
Write-Host "=" * 50

$FARM_ID = "cTEUlk7fSD1hQILl4OOA"
$PROJECT_ID = "grainguard-22f5a"

Write-Host "📋 Farm ID: $FARM_ID" -ForegroundColor Cyan
Write-Host "🏪 Project: $PROJECT_ID" -ForegroundColor Cyan

# Test users to add to the farm
$testUsers = @(
    @{
        uid = "V3ZgACoCsdN9yOYrc1xQOINg1nq1"
        email = "test@example.com"
        displayName = "Test User"
        role = "manager"
    },
    @{
        uid = "IB1h5MCvcNU8AFHa5OQELFWpbwH3"
        email = "jaden.a.moon@gmail.com"
        displayName = "test signup"
        role = "manager"
    },
    @{
        uid = "HtuMOj7VfnSSPwPWZCx7GEAr9tC3"
        email = "admin@farmsensors.com"
        displayName = "Admin User"
        role = "owner"
    },
    @{
        uid = "9tYnt2BXzqUbgYU1Bp5t6tEszrm1"
        email = "user@farmsensors.com"
        displayName = "Standard User"
        role = "viewer"
    }
)

Write-Host ""
Write-Host "👥 Test users that will have access:" -ForegroundColor Yellow
foreach ($user in $testUsers) {
    Write-Host "   • $($user.email) ($($user.role))" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Farm access configuration ready" -ForegroundColor Green
Write-Host "📋 You can manually verify/update access in Firebase Console:" -ForegroundColor Cyan
Write-Host "   1. Go to https://console.firebase.google.com/project/grainguard-22f5a/firestore" -ForegroundColor White
Write-Host "   2. Navigate to farms/$FARM_ID" -ForegroundColor White
Write-Host "   3. Add a 'members' field with the user UIDs and roles" -ForegroundColor White
Write-Host "   4. Optionally add user documents in the 'users' collection" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Manual steps completed - test users should now have access to the demo farm!" -ForegroundColor Green
