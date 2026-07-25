import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { document: string };

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Kamu adalah konsultan IT profesional yang meninjau dokumen spesifikasi proyek digital.

Tinjau dokumen spesifikasi berikut dan berikan feedback yang actionable:

---
${body.document}
---

Berikan review dalam format berikut (gunakan markdown):

## ✅ Kekuatan Spesifikasi
(2-3 poin positif)

## ⚠️ Hal yang Perlu Dilengkapi
(Informasi yang kurang atau ambigu yang bisa menyebabkan scope creep atau misunderstanding)

## 💡 Rekomendasi Tambahan
(Saran fitur atau pertimbangan teknis yang mungkin terlewat)

## 🎯 Kesimpulan
(1-2 kalimat: apakah dokumen sudah cukup siap untuk dikerjakan?)

Gunakan bahasa Indonesia yang profesional. Tetap singkat dan actionable.`,
    });

    return NextResponse.json({ review: text });
  } catch (error) {
    console.error("[/api/admin/studio-review]", error);
    return NextResponse.json({ error: "Failed to review document" }, { status: 500 });
  }
}
