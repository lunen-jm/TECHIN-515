import { db } from '../config';
import { 
  collection, addDoc, doc, getDoc, 
  getDocs, query, where, updateDoc, deleteDoc, orderBy, limit 
} from 'firebase/firestore';

// Types
interface Alert {
  alert_id?: string;
  device_id: string;
  type: string;
  message: string;
  is_resolved?: boolean;
}

// Create a new alert
export const createAlert = async (alertData: Alert) => {
  try {
    const docRef = await addDoc(collection(db, 'alerts'), {
      deviceId: alertData.device_id,
      type: alertData.type,
      message: alertData.message,
      createdAt: new Date(),
      isResolved: alertData.is_resolved || false
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

// Get a specific alert
export const getAlert = async (alertId: string) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    const alertSnapshot = await getDoc(alertRef);
    
    if (alertSnapshot.exists()) {
      return { id: alertSnapshot.id, ...alertSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting alert:", error);
    throw error;
  }
};

// Get all alerts for a device
export const getDeviceAlerts = async (deviceId: string) => {
  try {
    const alertsQuery = query(
      collection(db, 'alerts'), 
      where('deviceId', '==', deviceId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(alertsQuery);
    const alerts: any[] = [];
    
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    return alerts;
  } catch (error) {
    console.error("Error getting device alerts:", error);
    throw error;
  }
};

// Get all unresolved alerts
export const getUnresolvedAlerts = async (limit_count = 100) => {
  try {
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('isResolved', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(alertsQuery);
    const alerts: any[] = [];
    
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    return alerts;
  } catch (error) {
    console.error("Error getting unresolved alerts:", error);
    throw error;
  }
};

// Resolve an alert
export const resolveAlert = async (alertId: string) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    
    await updateDoc(alertRef, {
      isResolved: true
    });
    
    return alertId;
  } catch (error) {
    console.error("Error resolving alert:", error);
    throw error;
  }
};

// Delete an alert
export const deleteAlert = async (alertId: string) => {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
    return true;
  } catch (error) {
    console.error("Error deleting alert:", error);
    throw error;
  }
};