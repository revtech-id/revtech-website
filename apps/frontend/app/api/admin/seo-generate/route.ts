import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { DEFAULT_MODEL } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { title: string; category: string; content: string };

    const { text } = await generateText({
      model: google(DEFAULT_MODEL),
      prompt: `Kamu adalah pakar SEO konten digital Indonesia.

Berdasarkan informasi artikel berikut, generate metadata SEO yang optimal:
- Judul: ${body.title}
- Kategori: ${body.category}
- Cuplikan konten: ${body.content.slice(0, 500) || "(belum ada konten)"}

Balas HANYA dalam format JSON valid seperti ini (tanpa markdown, tanpa komentar):
{
  "metaTitle": "judul SEO maks 60 karakter",
  "metaDescription": "deskripsi menarik 150-160 karakter yang mendorong klik",
  "keywords": "kata kunci 1, kata kunci 2, kata kunci 3, kata kunci 4, kata kunci 5"
}`,
    });

    // Parse the JSON response
    const cleaned = text.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned) as { metaTitle: string; metaDescription: string; keywords: string };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[/api/admin/seo-generate]", error);
    return NextResponse.json({ error: "Failed to generate SEO" }, { status: 500 });
  }
}
