import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

/**
 * Verifies the Bearer token from the Authorization header.
 * Returns the decoded token or throws if invalid/unauthorized.
 */
export async function verifyAdminToken(req: Request, requiredRole?: string): Promise<{uid: string; role: string}> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const idToken = authHeader.split('Bearer ')[1];
  const adminAuth = getAdminAuth();
  const decoded = await adminAuth.verifyIdToken(idToken);

  if (requiredRole) {
    // Check role from Firestore
    const adminDb = getAdminDb();
    const adminSnap = await adminDb.collection('admins').where('email', '==', decoded.email).get();
    if (adminSnap.empty) {
      throw new Error('FORBIDDEN');
    }
    const userData = adminSnap.docs[0].data();
    if (userData.role !== requiredRole) {
      throw new Error('FORBIDDEN');
    }
    return { uid: decoded.uid, role: userData.role };
  }

  return { uid: decoded.uid, role: '' };
}

function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables. Mohon restart npm run dev.");
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Fix untuk Next.js env parsing yang terkadang membuat newline menjadi literal string
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  }
}
