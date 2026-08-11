/**
 * SOP Store — persists revtech-engine and AGENTS template to localStorage.
 * Studio reads from here; Settings writes here.
 */

import { REVTECH_ENGINE_DEFAULT } from "./revtechEngineDefault";

const KEY_ENGINE = "revtech_sop_engine";
const KEY_AGENTS = "revtech_sop_agents_template";

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

export function getEngineContent(): string {
  if (typeof window === "undefined") return REVTECH_ENGINE_DEFAULT;
  return localStorage.getItem(KEY_ENGINE) ?? REVTECH_ENGINE_DEFAULT;
}

export function saveEngineContent(content: string): void {
  localStorage.setItem(KEY_ENGINE, content);
}

export function getAgentsTemplate(): string {
  if (typeof window === "undefined") return AGENTS_TEMPLATE_DEFAULT;
  return localStorage.getItem(KEY_AGENTS) ?? AGENTS_TEMPLATE_DEFAULT;
}

export function saveAgentsTemplate(content: string): void {
  localStorage.setItem(KEY_AGENTS, content);
}

/** Interpolate {{placeholders}} in AGENTS template */
export function buildAgentsContent(params: {
  projectName: string;
  idea: string;
  techStack: string;
}): string {
  return getAgentsTemplate()
    .replace(/\{\{projectName\}\}/g, params.projectName)
    .replace(/\{\{idea\}\}/g, params.idea)
    .replace(/\{\{techStack\}\}/g, params.techStack);
}
