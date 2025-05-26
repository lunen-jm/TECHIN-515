# GrainGuard Farm Monitoring System

A comprehensive farm monitoring system with IoT sensors, cloud backend, and web interface for tracking grain bin conditions. This project is built using ESP32-based sensors, Firebase, and React.

## Project Structure

- **`cloudApp/`** - Main web application built with React and Material-UI
  - Deploys to Netlify
  - Uses Firebase for data storage and authentication
  - Includes dashboard for farm sensor monitoring

- **`webApp/`** - Next-generation web interface (in development)
  - Uses modern UI components
  - Enhanced device provisioning

- **`arduinoProjects/`** - ESP32 sensor firmware
  - `wifi_provisioning/` - WiFi setup and device registration
  - `sensors/` - Sensor reading and data transmission
  - `localDisplay/` - Code for optional display modules

- **`firebase/`** - Firebase cloud functions and rules
  - Device registration APIs
  - Security rules
  - Background processing

- **`PCB/`** - Hardware design files for sensor modules
  - KiCad PCB designs
  - 3D printable enclosure files
  - Manufacturing exports

## Getting Started

### Web Application

The main web application is located in the `cloudApp` directory. See [cloudApp/README.md](cloudApp/README.md) for detailed setup instructions.

1. Navigate to the cloudApp directory:
   ```
   cd cloudApp
   npm install
   npm start
   ```

2. Configure Firebase:
   - Create `.env.local` from `.env.template`
   - Add your Firebase credentials

### Hardware Setup

For device setup instructions, see [WiFi_Provisioning_Implementation_README.md](WiFi_Provisioning_Implementation_README.md).

## Deployment

### Netlify Deployment

The web application is configured for deployment on Netlify:
- Build settings already configured in `netlify.toml`
- Environment variables must be manually set in Netlify dashboard
- Client-side routing configured with `_redirects` 

### Firebase Deployment

Cloud functions can be deployed with:
```
cd firebase/functions
npm install
firebase deploy --only functions
```

## Documentation

- [WiFi Provisioning Plan](WiFi_Provisioning_Plan.md) - Technical design for device setup
- [WiFi Provisioning Implementation](WiFi_Provisioning_Implementation_README.md) - Implementation details
- [Database Structure](DBStructure.md) - Firestore data model
- [Security Documentation](SECURITY.md) - Comprehensive security measures and incident response

## Security Notes

### 🔐 Important Security Update (December 2024)

**Incident Summary**: During development, a Firebase API key was temporarily exposed in the git repository. This issue has been completely resolved with the following actions:

1. **Immediate Response**:
   - The exposed API key was immediately invalidated and replaced
   - The `.env` file was removed from git tracking
   - `.gitignore` was updated to prevent future `.env` file commits

2. **Security Enhancements**:
   - **Firebase App Check** with reCAPTCHA v3 integration for additional protection
   - API key restrictions configured in Google Cloud Console
   - Comprehensive security audit completed

3. **Why Your Data Remains Secure**:
   - Firebase API keys are **not secret** - they identify your project but don't grant privileged access
   - **Firebase Security Rules** control all data access permissions
   - **App Check** prevents unauthorized app usage
   - The exposed key had **no write permissions** to sensitive data

### General Security Practices

- ⚠️ `.env` files should never be committed to the repository
- Firebase security rules should be tightened for production  
- Test credentials should be replaced for deployment
- Regular security audits are performed before major releases

## License

All rights reserved © 2025