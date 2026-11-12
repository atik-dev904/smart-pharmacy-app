import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
const firebaseConfig = {
 apiKey:"AIzaSyA1FJ2jex_QRZiKZST8lguU8p2_78O3vDg",
 authDomain:"smart-pharmacy-b3db6.firebaseapp.com",
 projectId:"smart-pharmacy-b3db6",
 storageBucket:"smart-pharmacy-b3db6.firebasestorage.app",
 messagingSenderId:"1061575527322",
 appId:"1:1061575527322:web:97d52f878713eba4850823",
 measurementId:"G-906X72NYJK"
};
const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);