import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, verifyAdminToken } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // Hanya Superadmin yang boleh mereset sandi karyawan
    await verifyAdminToken(req, "Superadmin");

    const { uid, newPassword } = await req.json();

    if (!uid || !newPassword) {
      return NextResponse.json({ error: "UID and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Perbarui kata sandi pengguna langsung dari backend
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(uid, {
      password: newPassword
    });

    // Update flag requirePasswordChange di Firestore
    const adminDb = getAdminDb();
    await adminDb.collection('staff').doc(uid).update({
      requirePasswordChange: true
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: "Forbidden: Superadmin only" }, { status: 403 });
    }
    console.error("Error updating password:", error);
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}
