import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore'
import firebaseConfig from '../../firebase-applet-config.json'

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

/* CRITICAL: The app will break without specifying the firestoreDatabaseId from config */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'))
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message)
    }
  }
}

// Automatically test connection on import as mandated by Firebase skill
testFirestoreConnection()
