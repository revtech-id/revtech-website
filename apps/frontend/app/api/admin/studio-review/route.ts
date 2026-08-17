import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

type RequestBody =
  | { mode: "ai-stack"; idea: string; chatHistory?: {sender: string, text: string}[] }
  | { mode: "questions"; idea: string; techStack: string }
  | { mode: "generate"; idea: string; techStack: string; answers: Record<string, string> };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;

    // ── Mode 1: AI recommends a tech stack ────────────────────────────────────
    if (body.mode === "ai-stack") {
      const historyText = body.chatHistory 
        ? body.chatHistory.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n')
        : "";
      
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Kamu adalah arsitek software berpengalaman. Berdasarkan ide berikut, rekomendasikan tech stack yang paling tepat.
${historyText ? `\nRiwayat diskusi dengan user:\n${historyText}\n\nSesuaikan rekomendasi dengan riwayat diskusi terakhir!` : ''}

Ide: "${body.idea}"

Balas HANYA dalam JSON tanpa teks lain, format:
{
  "language": "<pilihan utama bahasa pemrograman, misal: TypeScript>",
  "styling": "<pilihan styling, misal: Tailwind CSS>",
  "frontend": "<pilihan framework frontend>",
  "backend": "<pilihan framework backend>",
  "database": "<pilihan database>",
  "deployment": "<pilihan hosting>",
  "reason": "<alasan singkat 1-2 kalimat kenapa stack ini cocok>",
  "message": "<pesan chat dari Anda (sebagai AI) merespons chat terakhir user, jelaskan sedikit perubahan yang dilakukan atau tanyakan konfirmasi>"
}`,
      });
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in response");
      const json = JSON.parse(match[0]);
      return NextResponse.json({ stack: json });
    }

    // ── Mode 2: Generate clarifying questions ─────────────────────────────────
    if (body.mode === "questions") {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Kamu adalah konsultan IT senior. Berdasarkan ide dan tech stack berikut, buat 4-5 pertanyaan klarifikasi KRUSIAL yang harus dijawab sebelum pengembangan dimulai.

Ide: "${body.idea}"
Tech Stack: ${body.techStack}

Balas HANYA dalam JSON array tanpa teks lain, format:
[
  { "id": "q1", "question": "<pertanyaan>", "hint": "<contoh jawaban singkat>" },
  { "id": "q2", "question": "<pertanyaan>", "hint": "<contoh jawaban singkat>" }
]

Fokus pada: scope fitur, user roles, integrasi pihak ketiga, kebutuhan data/privasi, dan batasan teknis.`,
      });
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found in response");
      const questions = JSON.parse(match[0]);
      return NextResponse.json({ questions });
    }

    // ── Mode 3: Generate full project docs ───────────────────────────────────
    if (body.mode === "generate") {
      const answersText = Object.entries(body.answers)
        .map(([q, a]) => `- ${q}: ${a}`)
        .join("\n");

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Kamu adalah AI Architect yang membantu developer membangun produk digital. Berdasarkan informasi berikut, buat 3 dokumen teknis dalam format Markdown.

## Informasi Proyek
Ide: ${body.idea}
Tech Stack: ${body.techStack}

## Jawaban Klarifikasi
${answersText}

---

Hasilkan output HANYA dalam format JSON berikut (tanpa teks lain di luar JSON):
{
  "prd": "<isi PRD lengkap dalam Markdown, mulai dengan # PRD: ...>",
  "structure": "<isi project structure dalam Markdown, gunakan tree format, mulai dengan # Project Structure>",
  "tasks": "<isi task list dalam Markdown dengan checkbox [ ], mulai dengan # Task List>"
}

Untuk PRD sertakan: Latar Belakang, Tujuan, User Personas, User Stories, Fitur Utama, Non-Functional Requirements.
Untuk Structure: folder tree project sesuai tech stack yang dipilih.
Untuk Task List: tahapan dari setup awal hingga deployment, gunakan sub-task.`,
      });

      const docs = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json({ docs });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error: any) {
    console.error("EXACT ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to process request", stack: error.stack }, { status: 500 });
  }
}
