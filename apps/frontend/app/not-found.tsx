import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="text-9xl font-black text-gray-200 mb-4 tracking-tighter">404</div>
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
        Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
      </p>
      <Button asChild size="lg" className="bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/20">
        <Link href="/">
          Kembali ke Beranda
        </Link>
      </Button>
    </div>
  );
}
