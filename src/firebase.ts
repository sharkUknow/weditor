import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

/** Try popup first; if blocked, fall back to redirect. */
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: any) {
    if (err.code === 'auth/popup-blocked') {
      // ponytail: redirect fallback for browsers that block popups on prod domains.
      // getRedirectResult() in App.tsx will resolve the credential on next load.
      return signInWithRedirect(auth, provider);
    }
    throw err;
  }
};

/** Call once on app mount to resolve any pending redirect sign-in. */
export const resolveRedirect = () => getRedirectResult(auth);

export const logout = () => signOut(auth);
