import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAH_XUipBbFLB87zzVvDpLj9USRE7s5YVU",
  authDomain: "giftreserve-66f0d.firebaseapp.com",
  projectId: "giftreserve-66f0d",
  storageBucket: "giftreserve-66f0d.firebasestorage.app",
  messagingSenderId: "1022923587611",
  appId: "1:1022923587611:web:158e63e64773c89f94b8be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
