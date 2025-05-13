# Farm Sensor Dashboard Web App

This project provides a web dashboard for monitoring sensor data from farm devices.

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

3. **Development Tools**:
   - Added initialization button (in development mode only) for setting up database schema
   - Added test data generator button (in development mode only) for populating test data
   - Implemented proper error handling and notifications for these operations

**Current Status**: Firebase is set up, database schema is initialized, and test data has been added to the database.

**Next Steps**:
- Develop dashboard UI components to display device data
- Implement data visualization for sensor readings
- Create device detail views with historical data
- Build farm grouping and filtering functionality

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
   - The first time you run the application, it will automatically set up the necessary collections in Firestore
   - Alternatively, you can call the `initializeSchema()` function from the Firebase console

## Security

- The `.env.local` file containing your Firebase credentials is automatically excluded from Git by the `.gitignore` file
- For production deployment, use environment secrets in your hosting platform (Vercel, Netlify, etc.)
- Set up Firestore Security Rules in the Firebase Console to restrict access to your data

### Development Rules

For initial development without authentication, use these rules to allow reading data but prevent writing from the webapp:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reading all data
    // Prevent writing from webapp (writing will be done by external devices/services)
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

When implementing external device data uploads, you'll need to:
1. Use Firebase Admin SDK in your backend service
2. Create a service account with appropriate permissions
3. Use that service account to authenticate and write data to Firestore

This approach keeps your webapp in read-only mode while allowing controlled data uploads from your sensor devices through a secured backend process.

### Production Rules

When ready for authentication system:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUserAdmin() {
      return isAuthenticated() && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.localAdmin == true || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.globalAdmin == true);
    }
    
    function isDeviceOwner(deviceId) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/devices/$(deviceId)).data.userId == request.auth.uid;
    }
    
    function ownsDevice(deviceId) {
      return isAuthenticated() && exists(/databases/$(database)/documents/devices/$(deviceId)) && 
        get(/databases/$(database)/documents/devices/$(deviceId)).data.userId == request.auth.uid;
    }
    
    function isFarmOwner(farmId) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/farms/$(farmId)).data.userId == request.auth.uid;
    }
    
    // User rules
    match /users/{userId} {
      // Users can read and update their own profiles
      allow read: if isAuthenticated() && (request.auth.uid == userId || isUserAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && 
        (request.auth.uid == userId || isUserAdmin()) &&
        // Prevent users from giving themselves admin rights
        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['globalAdmin']) || isUserAdmin());
      allow delete: if isUserAdmin();
    }
    
    // Device rules
    match /devices/{deviceId} {
      // Users can read all devices but can only modify their own
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && ownsDevice(deviceId);
      allow delete: if isAuthenticated() && ownsDevice(deviceId);
    }
    
    // Farm (Group) rules
    match /farms/{farmId} {
      // Users can read all farms but can only modify their own
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isFarmOwner(farmId);
      allow delete: if isAuthenticated() && isFarmOwner(farmId);
    }
    
    // Device membership rules
    match /farmDevices/{membershipId} {
      // Allow reading memberships by anyone authenticated
      allow read: if isAuthenticated();
      
      // For creating/updating memberships, validate both the farm and device ownership
      allow create, update: if isAuthenticated() && 
        isFarmOwner(request.resource.data.farmId) && 
        ownsDevice(request.resource.data.deviceId);
        
      // For deleting, check if user owns the farm that the membership is part of
      allow delete: if isAuthenticated() && 
        isFarmOwner(get(/databases/$(database)/documents/farmDevices/$(membershipId)).data.farmId);
    }
    
    // Reading rules - apply to all sensor reading types
    match /humidity_readings/{readingId} {
      // Allow reading by any authenticated user
      allow read: if isAuthenticated();
      
      // For creating, verify the device ownership
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      
      // Updates and deletions only by device owner
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/humidity_readings/$(readingId)).data.deviceId);
    }
    
    match /co2_readings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/co2_readings/$(readingId)).data.deviceId);
    }
    
    match /temperature_readings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/temperature_readings/$(readingId)).data.deviceId);
    }
    
    match /lidar_readings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/lidar_readings/$(readingId)).data.deviceId);
    }
    
    match /outdoor_temp_readings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/outdoor_temp_readings/$(readingId)).data.deviceId);
    }
    
    // Alert rules
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      
      // For creating, check device ownership
      allow create: if isAuthenticated() && ownsDevice(request.resource.data.deviceId);
      
      // For updating and deleting, check device ownership based on existing alert
      allow update, delete: if isAuthenticated() && 
        ownsDevice(get(/databases/$(database)/documents/alerts/$(alertId)).data.deviceId);
    }
  }
}
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
