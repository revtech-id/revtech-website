import { NextResponse } from "next/server";
import { getAdminAuth, verifyAdminToken } from "@/lib/firebaseAdmin";

export async function DELETE(req: Request) {
  try {
    // Hanya Superadmin yang boleh menghapus karyawan
    await verifyAdminToken(req, "Superadmin");

    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true, message: "User deleted from Firebase Auth" });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: "Forbidden: Superadmin only" }, { status: 403 });
    }
    console.error("Error deleting user from Auth:", error);
    // Jika user tidak ditemukan di Auth (sudah terhapus), abaikan saja errornya
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ success: true, message: "User already not in Auth" });
    }
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
