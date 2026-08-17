const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.*)'/s);
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

async function check() {
  const admins = await db.collection('admins').get();
  console.log("Admins count:", admins.size);
  admins.forEach(doc => console.log(doc.id, doc.data()));
  process.exit(0);
}

check().catch(console.error);
