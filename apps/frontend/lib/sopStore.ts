/**
 * SOP Store — persists revtech-engine and AGENTS template to Firestore.
 * Studio reads from here; Settings writes here.
 */

import { REVTECH_ENGINE_DEFAULT } from "./revtechEngineDefault";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AGENTS_TEMPLATE_DEFAULT = `# AGENTS.md — {{projectName}}

> Baca file ini pertama kali. Ia mengarahkan kamu ke semua konteks yang diperlukan sebelum menulis kode.

## Konteks Proyek

**Ide:** {{idea}}
**Tech Stack:** {{techStack}}

## Dokumen yang Wajib Dibaca (urutan penting)

| # | File | Isi |
|---|------|-----|
| 0 | \`revtech-engine.md\` | SOP engineering universal — HOW to code |
| 1 | \`docs/prd.md\` | Scope, fitur, user story, acceptance criteria |
| 2 | \`docs/brand.md\` | Warna, tipografi, tone of voice |
| 3 | \`docs/design.md\` | Spacing, komponen, animasi, responsif |
| 4 | \`docs/architecture.md\` | Struktur folder, data flow, state management |
| 5 | \`docs/manifest.md\` | Task checklist — kerjakan ini setelah baca semua di atas |

## Mulai dari Sini

Setelah membaca semua dokumen di atas, konfirmasi pemahamanmu lalu buka \`docs/manifest.md\` dan kerjakan dari atas ke bawah.`;

export async function getEngineContent(): Promise<string> {
  try {
    const docRef = doc(db, "settings", "sop");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().engine) {
      return docSnap.data().engine;
    }
  } catch (err) {
    console.error("Failed to fetch engine content from Firestore:", err);
  }
  return REVTECH_ENGINE_DEFAULT;
}

export async function saveEngineContent(content: string): Promise<void> {
  try {
    const docRef = doc(db, "settings", "sop");
    await setDoc(docRef, { engine: content }, { merge: true });
  } catch (err) {
    console.error("Failed to save engine content to Firestore:", err);
  }
}

export async function getAgentsTemplate(): Promise<string> {
  try {
    const docRef = doc(db, "settings", "sop");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().agents) {
      return docSnap.data().agents;
    }
  } catch (err) {
    console.error("Failed to fetch agents template from Firestore:", err);
  }
  return AGENTS_TEMPLATE_DEFAULT;
}

export async function saveAgentsTemplate(content: string): Promise<void> {
  try {
    const docRef = doc(db, "settings", "sop");
    await setDoc(docRef, { agents: content }, { merge: true });
  } catch (err) {
    console.error("Failed to save agents template to Firestore:", err);
  }
}

/** Interpolate {{placeholders}} in AGENTS template */
export async function buildAgentsContent(params: {
  projectName: string;
  idea: string;
  techStack: string;
}): Promise<string> {
  const template = await getAgentsTemplate();
  return template
    .replace(/\{\{projectName\}\}/g, params.projectName)
    .replace(/\{\{idea\}\}/g, params.idea)
    .replace(/\{\{techStack\}\}/g, params.techStack);
}
