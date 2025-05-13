# TECHIN-515

# Firebase Setup Instructions

## Credentials Setup
1. Get your service account key from Firebase Console:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file
2. Rename the downloaded JSON file to `firebase-adminsdk.json`
3. Place it in `cloudApp/scripts/firestore-seed/`
4. Never commit this file to git - it's already in .gitignore