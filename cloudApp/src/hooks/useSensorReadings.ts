import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp, FirestoreError } from 'firebase/firestore';
import { db } from '../services/firebase';

interface SensorReading {
  timestamp: Timestamp;
  humidity: number;
  co2_concentration: number;
  temperature: number;
  lidar_distance: number;
  device_id: string;
}

export const useSensorReadings = (deviceId: string) => {
  const [readings, setReadings] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time listener for device:', deviceId);
    const sensorReadingsRef = collection(db, 'sensorReadings');
      const q = query(
      sensorReadingsRef,
      where('device_id', '==', deviceId),
      orderBy('timestamp', 'asc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Received real-time update. Empty?', snapshot.empty, 'Size:', snapshot.size);
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as SensorReading;
          console.log('New sensor reading:', data);
          setReadings(data);
        } else {
          console.log('No readings available');
          setReadings(null);
        }
        setLoading(false);
        setError(null);
      },
      (error: FirestoreError) => {
        console.error('Error in real-time updates:', error);
        
        // Handle specific Firebase errors
        if (error.code === 'failed-precondition') {
          setError('This query requires an index. Please wait for the index to be built.');
        } else if (error.code === 'permission-denied') {
          setError('Permission denied. Please check Firebase security rules.');
        } else if (error.code === 'unavailable') {
          setError('Firebase service is temporarily unavailable. Please try again later.');
        } else {
          setError(`Error: ${error.message}`);
        }
        
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from real-time updates
    return () => {
      console.log('Cleaning up listener for device:', deviceId);
      unsubscribe();
    };
  }, [deviceId]);

  return { readings, loading, error };
};