// Loads Firebase on demand. Public pages only ever *write* a message, so they
// use the small "lite" Firestore build; the manager portal loads the full one.
import { FIREBASE_SDK, firebaseConfig, LOCAL, EMULATORS } from './config.js';

let litePromise;

/** Firestore (lite) for saving website messages. */
export function firestoreLite() {
  litePromise ??= (async () => {
    const [{ initializeApp, getApps }, fs] = await Promise.all([
      import(`${FIREBASE_SDK}/firebase-app.js`),
      import(`${FIREBASE_SDK}/firebase-firestore-lite.js`),
    ]);
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const db = fs.getFirestore(app);
    if (LOCAL) fs.connectFirestoreEmulator(db, ...EMULATORS.firestore);
    return { db, collection: fs.collection, addDoc: fs.addDoc, serverTimestamp: fs.serverTimestamp };
  })().catch((error) => {
    litePromise = undefined; // let the next attempt try again
    throw error;
  });
  return litePromise;
}

/** Save one document and resolve when Firestore has accepted it. */
export async function save(collectionName, data) {
  const { db, collection, addDoc, serverTimestamp } = await firestoreLite();
  return addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
}
