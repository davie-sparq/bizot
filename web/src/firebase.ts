import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDLNHoadk2jjGSPxOloEdr8niq2ciEuPbE",
    authDomain: "business-chat-bot-49f34.firebaseapp.com",
    projectId: "business-chat-bot-49f34",
    storageBucket: "business-chat-bot-49f34.firebasestorage.app",
    messagingSenderId: "412178154360",
    appId: "1:412178154360:web:5592214958f8e411cd7e8d",
    measurementId: "G-CELG869436"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
