import { generateText } from 'ai';
import { google, DEFAULT_MODEL, STUDIO_SYSTEM_PROMPT } from '@/lib/ai';

export const maxDuration = 60; // Studio docs can be long

export async function POST(req: Request) {
  try {
    const { data, stackLabel, docType } = await req.json();

    let prompt = `Tolong buatkan dokumen Markdown untuk: ${docType}\n\n`;
    prompt += `Detail Proyek:\n- Nama: ${data.projectName}\n- Deskripsi: ${data.description}\n- Audiens: ${data.audience}\n- Fitur Utama: ${data.features}\n- Style: ${data.stylePreference}\n`;
    if (stackLabel) {
      prompt += `- Tech Stack: ${stackLabel}\n`;
    }

    if (docType === 'prd') {
      prompt += `Fokuskan pada Product Requirement Document yang detail, mencakup Latar Belakang, User Personas, User Stories, Fitur Utama, dan Non-Functional Requirements.`;
    } else if (docType === 'brand') {
      prompt += `Fokuskan pada Brand Guide, mencakup Tone of Voice, Gaya Visual, Palet Warna (rekomendasikan kode hex), dan Tipografi.`;
    } else if (docType === 'design') {
      prompt += `Fokuskan pada Design System, mencakup Prinsip Desain, Spacing Scale, Border Radius, dan Komponen Standar.`;
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
