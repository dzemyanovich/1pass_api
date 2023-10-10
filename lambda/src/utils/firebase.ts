import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin';

import { isTokenExpired } from './auth';
import { FIREBASE_COLLECTION_NAME } from './constants';

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // eslint-disable-next-line max-len
  // replace is required because https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
} as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendNotification(
  userId: number,
  sportObjectId: number,
  title: string,
  body: string,
): Promise<void> {
  const db = getFirestore();
  const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(userId.toString());
  const currentValue = (await docRef.get()).data() as FirebaseTokenData | undefined;
  const tokens: string[] = currentValue?.data.map((tokenValue: FirebaseTokenValue) => tokenValue.token) || [];

  if (tokens.length) {
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        userId: userId.toString(),
        sportObjectId: sportObjectId.toString(),
      },
    });
  }
}

export async function storeFirebaseToken(userTokenData: TokenData, firebaseToken: string): Promise<void> {
  const { userId, createdAt } = userTokenData;
  const db = getFirestore();
  const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(userId.toString());
  const currentValue = (await docRef.get()).data() as FirebaseTokenData | undefined;

  const newValue: FirebaseTokenData = {
    data: [],
  };

  if (!currentValue) {
    newValue.data = [{
      token: firebaseToken,
      createdAt,
    }];
  } else if (currentValue.data.find((tokenValue: FirebaseTokenValue) => tokenValue.token === firebaseToken)) {
    newValue.data = currentValue.data;
  } else {
    newValue.data = currentValue.data.concat({
      token: firebaseToken,
      createdAt,
    });
  }

  await docRef.set(newValue);
}

export async function getFirebaseTokens(userId: number): Promise<string[]> {
  const db = getFirestore();
  const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(userId.toString());
  const currentValue = (await docRef.get()).data() as FirebaseTokenData | undefined;

  return currentValue?.data.map((tokenValue: FirebaseTokenValue) => tokenValue.token) || [];
}

export async function deleteFirebaseToken(userId: number, firebaseToken: string): Promise<void> {
  const db = getFirestore();
  const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(userId.toString());
  const currentValue = (await docRef.get()).data() as FirebaseTokenData | undefined;

  if (!currentValue) {
    // eslint-disable-next-line no-console
    console.log(`Firebase document with id = ${userId} cannot be found`);
    return;
  }

  const newValue: FirebaseTokenData = {
    data: [],
  };

  currentValue.data.forEach((tokenValue: FirebaseTokenValue) => {
    if (tokenValue.token !== firebaseToken) {
      newValue.data.push(tokenValue);
    }
  });

  if (newValue.data.length !== currentValue.data.length) {
    await docRef.set(newValue);
  } else {
    // eslint-disable-next-line no-console
    console.log(`firebase token ${firebaseToken} not found for used id = ${userId}`);
  }
}

export async function deleteExpiredTokens() {
  const db = getFirestore();
  const collection = await db.collection(FIREBASE_COLLECTION_NAME).get();

  for (const doc of collection.docs) {
    const currentValue = doc.data() as FirebaseTokenData | undefined;
    const newValue: FirebaseTokenData = {
      data: [],
    };

    currentValue?.data.forEach((tokenValue: FirebaseTokenValue) => {
      if (!isTokenExpired(tokenValue.createdAt)) {
        newValue.data.push(tokenValue);
      }
    });

    if (currentValue && newValue.data.length !== currentValue.data.length) {
      const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(doc.id.toString());
      await docRef.set(newValue);
    }
  }
}

// for testing purposes only
export async function deleteFirebaseCollection(userId: number): Promise<void> {
  const db = getFirestore();
  const docRef = db.collection(FIREBASE_COLLECTION_NAME).doc(userId.toString());
  await docRef.delete();
}
