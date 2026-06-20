import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase config is valid (has at least apiKey and projectId)
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth: any;
let db: any;
let googleProvider: any;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    setupDummyServices();
  }
} else {
  console.warn("Firebase config is missing or incomplete. Please configure VITE_FIREBASE_* variables in .env file.");
  setupDummyServices();
}

function setupDummyServices() {
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: (user: any) => void) => {
      // Resolve loading state immediately with no user
      callback(null);
      return () => {};
    }
  } as any;
  
  db = {} as any;
  googleProvider = {};
}

export { auth, db, googleProvider };

export const signInWithGoogle = () => {
  if (!isFirebaseConfigured) {
    alert("Firebase 尚未設定！請建立 .env 檔案並設定 VITE_FIREBASE_* 金鑰。");
    return Promise.resolve();
  }
  // ponytail: no redirect fallback — signInWithRedirect silently fails in prod
  // because modern browsers block the cross-origin iframe Firebase uses to
  // retrieve the token from firebaseapp.com (third-party storage blocking).
  // When popup is blocked, let auth/popup-blocked propagate to the UI.
  return signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  if (!isFirebaseConfigured) return;
  return signOut(auth);
};
