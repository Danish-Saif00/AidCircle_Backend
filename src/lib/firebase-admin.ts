import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

import { env } from "../config/env.js";

type FirebaseServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getFirebaseServiceAccount(): FirebaseServiceAccount | null {
  const { projectId, clientEmail, privateKey } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

const firebaseServiceAccount = getFirebaseServiceAccount();

export const isFirebaseConfigured = firebaseServiceAccount !== null;

function createFirebaseApp(): App | null {
  if (!firebaseServiceAccount) {
    return null;
  }

  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    credential: cert(firebaseServiceAccount),
  });
}

export const firebaseApp = createFirebaseApp();

export const firebaseMessaging: Messaging | null = firebaseApp
  ? getMessaging(firebaseApp)
  : null;