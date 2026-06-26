/**
 * fire-dev.js - Production firebase configuration
 * Since both the compat and modular firebase APIs are used in this project, this file exports both the compat database and the modular database.
 * The compat database is used in the Util class shared with firebase functions to check if the user is registered, and the modular database is used in the rest of the codebase.
 */
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const config = {
  /* CONFIG FROM FIREBASE CONSOLE */
  apiKey: 'AIzaSyBxl61gy473Yq7KDT_838HYPnRsfZz_Y5M',
  authDomain: 'crewtimer-results.firebaseapp.com',
  databaseURL: 'https://crewtimer-results.firebaseio.com',
  projectId: 'crewtimer-results',
  storageBucket: 'crewtimer-results.appspot.com',
  messagingSenderId: '990343924949',
};

// Use compat initialization as we can get the modular references from the compat app, but not the other way around. See https://firebase.google.com/docs/web/modular-upgrade#initialize-the-app-with-compat-and-modular-sdks.
firebase.initializeApp(config);

export const app = firebase.app();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
export const compatDatabase = firebase.database();
export const projectId = config.projectId;
