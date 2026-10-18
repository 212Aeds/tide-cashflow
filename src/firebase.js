import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDuwtrVSSaKW5qw4WnzS_SQi10VpgqXZyg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tide-36b83.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tide-36b83',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:203382745930:web:fbc5e726791ff9c3bdefb3',
}

export const configured = Object.values(config).every(Boolean)
const app = configured ? initializeApp(config) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
