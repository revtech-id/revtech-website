import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// TODO: Add rate limiting and auth check for production use
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { stats: Record<string, unknown>; date: string };
    const { stats, date } = body;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Kamu adalah RevTech AI Business Co-Pilot, asisten bisnis cerdas untuk seorang solo founder agensi digital bernama RevTech.

Hari ini adalah ${date}.

Data bisnis saat ini:
- Proyek aktif: ${stats.activeOrders}
- Total pendapatan terkonfirmasi: Rp ${Number(stats.totalRevenue).toLocaleString("id-ID")}
- Tagihan pending (belum dibayar klien): Rp ${Number(stats.pendingRevenue).toLocaleString("id-ID")}
- Total proyek selesai: ${stats.completedOrders}

Berikan 1 paragraf singkat (maks 3 kalimat) berisi insight/saran strategis yang actionable untuk hari ini. Fokus pada hal yang paling kritis: apakah follow-up tagihan pending, prioritas pengerjaan, atau peluang pertumbuhan. Gunakan bahasa Indonesia yang profesional namun santai. Jangan ulangi data mentah, berikan analisis dan rekomendasi konkret.`,
    });

    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error("[/api/admin/insight]", error);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}
