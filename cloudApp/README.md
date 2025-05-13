# Farm Sensor Dashboard Web App

This project provides a web dashboard for monitoring sensor data from farm devices. It uses React, Material-UI, Firebase, and Netlify to create a responsive and intuitive interface for agricultural monitoring.

## Development Progress (May 13, 2025)

We've set up the following components:

1. **Firebase Integration**:
   - Configured Firebase with environment variables for secure credential storage
   - Created Firestore database services for devices, readings, farms, and alerts
   - Set up proper security rules for development (allowing reads but restricting writes)
   - Implemented schema initialization for database setup

2. **Test Data Generation**:
   - Created a test data generator that adds 6 sample devices with different bin types (crops)
   - Each device has 30 readings for each sensor type (humidity, CO2, temperature, LiDAR, outdoor temperature)
   - Readings are timestamped 1 second apart for easy sorting and visualization
   - All test devices belong to a single test farm

3. **UI Structure Implementation**:
   - Designed and implemented a collapsible sidebar navigation layout
   - Created farm selection dashboard as the initial view
   - Implemented farm detail view showing device cards with latest readings
   - Built device detail dashboard with expandable sensor data cards and tabbed navigation
   - Added admin panel for database management features

4. **Netlify Deployment Setup**:
   - Configured netlify.toml with proper build settings and redirect rules
   - Set up environment variables for Firebase authentication in Netlify
   - Added CI=false in environment variables to prevent treating warnings as errors
   - Fixed ESLint issues that were preventing successful builds

**Current Status**: 
- Firebase is fully set up and integrated
- UI structure with all major components is implemented
- Deployment configuration for Netlify is complete
- The application is ready for deployment with a functioning test data system

**Next Steps**:
- Implement data visualization charts for the device detail views
- Add user authentication and profile management functionality
- Create alert notifications system with email integration
- Implement device configuration and settings pages
- Add data export and reporting features

## Firebase Setup

This application uses Firebase for data storage. Follow these steps to set up your Firebase project:

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup process
   - Enable Firestore Database in the Firebase console

2. **Configure your environment**
   - Copy the `.env.template` file to `.env.local`
   - Get your Firebase config from Project Settings > Your Apps > SDK setup and configuration
   - Fill in the variables in `.env.local` with your Firebase project details:
     ```
     REACT_APP_FIREBASE_API_KEY=your-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     REACT_APP_FIREBASE_APP_ID=your-app-id
     ```

3. **Initialize the Database**
   - After setting up Firebase, use the Admin Panel in the application
   - Click the Admin icon in the top toolbar (only visible in development mode)
   - Use the "Initialize Database Schema" button to set up collections
   - Use the "Seed Test Data" button to populate test data

## Firebase Security Rules

For your reference, here are the security rules you should set in your Firebase Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rules
    match /{document=**} {
      allow read: if true;  // Allow reads for development
      allow write: if false; // Deny writes by default
    }
    
    // User data rules
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Device rules
    match /devices/{deviceId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Farm rules
    match /farms/{farmId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Farm devices association rules
    match /farmDevices/{membershipId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Reading rules - allow devices to write their own readings
    match /humidity_readings/{readingId} {
      allow read: if true;
      allow create: if true; // In production, use API key or device auth
    }
    
    match /co2_readings/{readingId} {
      allow read: if true;
      allow create: if true;
    }
    
    match /temperature_readings/{readingId} {
      allow read: if true;
      allow create: if true;
    }
    
    match /lidar_readings/{readingId} {
      allow read: if true;
      allow create: if true;
    }
    
    match /outdoor_temp_readings/{readingId} {
      allow read: if true;
      allow create: if true;
    }
    
    // Alert rules
    match /alerts/{alertId} {
      allow read: if true;
      allow create: if true; 
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

**Note**: These rules are suitable for development but should be tightened for production. In a production environment, you should restrict read access to authenticated users and implement proper permission checks based on user roles and ownership.

## Deployment Process

This application is configured for deployment with Netlify. Follow these steps to deploy:

1. **Prepare Your Project**
   - Make sure your `.env.local` file is not committed to git (should be in `.gitignore`)
   - Verify the `homepage: "."` is set in package.json

2. **Set Up Netlify**
   - Create an account on [Netlify](https://app.netlify.com/)
   - Connect your GitHub repository
   - Configure build settings:
     * Base directory: [repository root or cloudApp depending on your repo structure]
     * Build command: `npm run build`
     * Publish directory: `build`

3. **Configure Environment Variables**
   - In Netlify dashboard, go to Site Settings > Build & Deploy > Environment
   - Add all your Firebase environment variables:
     * REACT_APP_FIREBASE_API_KEY
     * REACT_APP_FIREBASE_AUTH_DOMAIN
     * REACT_APP_FIREBASE_PROJECT_ID
     * REACT_APP_FIREBASE_STORAGE_BUCKET
     * REACT_APP_FIREBASE_MESSAGING_SENDER_ID
     * REACT_APP_FIREBASE_APP_ID
   - Add CI=false to prevent treating warnings as errors

4. **Deploy Your Site**
   - Trigger a deploy from the Netlify dashboard
   - Once deployed, you can access your site at the URL provided by Netlify

## Troubleshooting

If you encounter any issues with the application, check the following:

1. **Firebase Connection**: Ensure your Firebase credentials are correct in the environment variables
2. **Database Rules**: Verify the Firestore security rules allow the operations you're trying to perform
3. **Build Errors**: Set `CI=false` in your environment variables if you get build failures due to warnings
4. **Deployment Issues**: Check the Netlify deployment logs for specific error messages

## Project Structure

The project is organized with the following structure:

```
cloudApp/
  ├── public/              # Static files
  └── src/
      ├── components/      # React components
      │   ├── cards/       # Card components (Device, Sensor, Dashboard)
      │   ├── dashboard/   # Dashboard views (Farm, Device, Overview)
      │   └── layout/      # Layout components (MainLayout)
      ├── firebase/        # Firebase configuration and services
      │   └── services/    # Firebase service functions
      └── ...              # Other configuration files
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Installs dependencies and starts the development server.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
