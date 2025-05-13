import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnkZScLciNPCJ-2qTqoIu2H-AADM22MBo",
  authDomain: "techin-515-2ed91.firebaseapp.com",
  projectId: "techin-515-2ed91",
  storageBucket: "techin-515-2ed91.firebasestorage.app",
  messagingSenderId: "1089062026991",
  appId: "1:1089062026991:web:b8e67feeca6565fa46651a",
  measurementId: "G-BMP6CH0T6P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);