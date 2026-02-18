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

// Initialize Firebase with the modular SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);