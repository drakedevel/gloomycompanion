import firebase from 'firebase/app';

import config from './config';

export const useFirebase = config.useFirebase;

// Initialize Firebase
function init() {
  if (useFirebase) {
    if (config.useFirebaseHosting) {
      // Already initialized by environment
      return firebase;
    }
    return firebase.initializeApp(config.firebase);
  }
  return null;
}

export default init();
