const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.*)'/s);
if (!match) throw new Error("Service account key not found in .env.local");
const serviceAccount = JSON.parse(match[1]);

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

const collectionsToWipe = [
  'leads',
  'staff',
  'portfolio',
  'trash',
  'testimonials',
  'orders',
  'maintenance',
  'studio_drafts',
  'invoices',
  'digital_products',
  'posts',
  'blog_posts',
  'activity_logs'
];

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (err) {
    reject(err);
  }
}

async function wipe() {
  console.log('Starting DB wipe...');
  for (const collectionName of collectionsToWipe) {
    console.log(`Deleting collection: ${collectionName}`);
    const query = db.collection(collectionName).limit(500);
    await new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve, reject);
    });
    console.log(`- Cleared ${collectionName}.`);
  }
  
  console.log('Wipe complete!');
  process.exit(0);
}

wipe().catch(err => {
    console.error(err);
    process.exit(1);
});
