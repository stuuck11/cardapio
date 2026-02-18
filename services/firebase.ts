
// Modular Firebase SDK initialization
// Fix: Using namespace import as a workaround for the 'no exported member initializeApp' resolution error
import * as firebase from 'firebase/app';
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

// Fix: Initialize using the namespace to ensure the method is found
const app = firebase.initializeApp(firebaseConfig);
// Export Firestore database instance for use in AppContext
export const db = getFirestore(app);
