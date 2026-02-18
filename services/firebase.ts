
// Modular Firebase SDK initialization
// Fixed: Replaced namespace import with named import to resolve 'Property initializeApp does not exist' error
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACx94SBu8vo5HL9c4xg8wIOUzcAFCYeuY",
  authDomain: "cardapio-ffef0.firebaseapp.com",
  projectId: "cardapio-ffef0",
  storageBucket: "cardapio-ffef0.firebasestorage.app",
  messagingSenderId: "852904811701",
  appId: "1:852904811701:web:852b0d33519cf1c24bf2fc",
  measurementId: "G-E8BPMB4MHJ"
};

// Fixed: Initialize using the named export initializeApp to resolve property lookup error on namespace
const app = initializeApp(firebaseConfig);
// Export Firestore database instance for use in AppContext
export const db = getFirestore(app);
