import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// TODO: Add auth check for production use
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      client: string;
      service: string;
      status: string;
      total: string;
      dp: string;
    };

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Kamu adalah asisten RevTech yang membantu membuat pesan WhatsApp follow-up profesional namun hangat kepada klien.

Detail klien:
- Nama: ${body.client}
- Layanan: ${body.service}
- Status proyek: ${body.status}
- Total tagihan: ${body.total}
- DP yang sudah dibayar: ${body.dp}

Buat pesan WhatsApp follow-up yang:
1. Dimulai dengan salam hangat dan menyebut nama klien
2. Kontekstual sesuai status "${body.status}" (misal: jika Revisi, tanyakan feedback; jika Pelunasan, ingatkan sisa pembayaran dengan sopan; jika Pengerjaan, update progres)
3. Singkat, tidak lebih dari 5-6 baris
4. Bahasa Indonesia yang sopan, profesional tapi santai (tidak kaku)
5. Diakhiri dengan CTA yang jelas

Berikan HANYA teks pesan, tanpa penjelasan tambahan.`,
    });

    return NextResponse.json({ draft: text });
  } catch (error) {
    console.error("[/api/admin/wa-draft]", error);
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
