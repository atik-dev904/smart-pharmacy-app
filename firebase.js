// ============================================
// SMART PHARMACY
// FIREBASE CONFIGURATION
// Powered by ATIK TECHNOLOGIES
// ============================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendPasswordResetEmail,
signOut,
onAuthStateChanged,
updatePassword,
reauthenticateWithCredential,
EmailAuthProvider
} from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
getFirestore,
doc,
collection,
addDoc,
getDoc,
getDocs,
setDoc,
updateDoc,
deleteDoc,
query,
where,
orderBy,
limit,
serverTimestamp,
runTransaction,
writeBatch,
increment,
onSnapshot,
Timestamp
} from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
apiKey: "AIzaSyA1FJ2jex_QRZiKZST8lguU8p2_78O3vDg",
authDomain: "smart-pharmacy-b3db6.firebaseapp.com",
projectId: "smart-pharmacy-b3db6",
storageBucket: "smart-pharmacy-b3db6.firebasestorage.app",
messagingSenderId: "1061575527322",
appId: "1:1061575527322:web:97d52f878713eba4850823",
measurementId: "G-906X72NYJK"
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);

// ============================================
// INITIALIZE AUTHENTICATION
// ============================================

const auth = getAuth(app);

// ============================================
// INITIALIZE FIRESTORE
// ============================================

const db = getFirestore(app);

// ============================================
// EXPORT SERVICES
// ============================================

export {
app,
auth,
db,

// Authentication
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendPasswordResetEmail,
signOut,
onAuthStateChanged,
updatePassword,
reauthenticateWithCredential,
EmailAuthProvider,

// Firestore
doc,
collection,
addDoc,
getDoc,
getDocs,
setDoc,
updateDoc,
deleteDoc,
query,
where,
orderBy,
limit,
serverTimestamp,
runTransaction,
writeBatch,
increment,
onSnapshot,
Timestamp

};

console.log("SMART PHARMACY Firebase initialized successfully.");
