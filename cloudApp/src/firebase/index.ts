// Firebase services index file - exports all services for easy importing

// Config and initialization
export { app, db, auth } from './config';
export { initializeSchema, checkDatabaseSetup } from './initSchema';

// Services
export * from './services/deviceService';
export * from './services/readingsService';
export * from './services/farmService';
export * from './services/alertService';