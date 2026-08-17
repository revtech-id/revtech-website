import { generateText } from 'ai';
import { google, DEFAULT_MODEL, STUDIO_SYSTEM_PROMPT } from '@/lib/ai';

export const maxDuration = 60; // Studio docs can be long

export async function POST(req: Request) {
  try {
    const { data, stackLabel, docType, answers } = await req.json();

    let prompt = `Tolong buatkan dokumen Markdown untuk: ${docType}\n\n`;
    prompt += `Detail Proyek:\n- Nama: ${data.projectName}\n- Deskripsi: ${data.description}\n- Audiens: ${data.audience}\n- Fitur Utama: ${data.features}\n- Style: ${data.stylePreference}\n`;
    if (stackLabel) {
      prompt += `- Tech Stack: ${stackLabel}\n`;
    }
    
    if (answers && Object.keys(answers).length > 0) {
      prompt += `\nJawaban Klarifikasi Tambahan:\n`;
      Object.entries(answers).forEach(([q, a]) => {
        prompt += `- ${q}: ${a}\n`;
      });
    }

    if (docType === 'prd') {
      prompt += `\nFokuskan pada Product Requirement Document yang detail, mencakup Latar Belakang, User Personas, User Stories, Fitur Utama, dan Non-Functional Requirements.`;
    } else if (docType === 'brand') {
      prompt += `\nFokuskan pada Brand Guide, mencakup Tone of Voice, Gaya Visual, Palet Warna (rekomendasikan kode hex), dan Tipografi.`;
    } else if (docType === 'design') {
      prompt += `\nFokuskan pada Design System, mencakup Prinsip Desain, Spacing Scale, Border Radius, dan Komponen Standar.`;
    } else if (docType === 'architecture') {
      prompt += `\nFokuskan pada Arsitektur Sistem, mencakup:
1. Diagram Alur Sistem (jika perlu dijelaskan dalam teks)
2. Struktur Folder Proyek (direkomendasikan dalam bentuk tree text)
3. Skema Database / Entitas Utama
4. Pemilihan Teknologi secara teknis dan penjelasannya.`;
    } else if (docType === 'manifest') {
      prompt += `\nFokuskan pada Manifest / Checklist Tugas (Task List). Berikan daftar langkah-langkah implementasi menggunakan checklist (markdown - [ ] task) dari fase setup awal, backend, frontend, hingga deployment.`;
    }

    const result = await generateText({
      model: google(DEFAULT_MODEL),
      system: STUDIO_SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.5,
    });

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Studio Generate Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
