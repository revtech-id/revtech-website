import { getAdminDb } from '@/lib/firebaseAdmin';

import { PricingPlan } from '@/data/pricing';

export interface HandoverSimRow { label: string; value: string; total?: boolean; }
export interface HandoverOption {
  title: string;
  desc: string;
  simulations: HandoverSimRow[];
  simNote: string;
}

export interface ModItem { name: string; price: string; }
export interface ModCategory { category: string; description: string; items: ModItem[]; }

export interface JasaWebSettings {
  plans: PricingPlan[];
  handovers: HandoverOption[];
  mods: ModCategory[];
}

export async function getJasaWebSettings(): Promise<JasaWebSettings | null> {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection('settings').doc('jasa-web').get();
    
    if (docSnap.exists) {
      return docSnap.data() as JasaWebSettings;
    }
    return null;
  } catch (err) {
    console.error('[jasa-web] getJasaWebSettings failed:', err);
    return null;
  }
}
