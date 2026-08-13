"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-4xl">warning</span>
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Terjadi Kesalahan</h2>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
        Maaf, sistem kami mengalami kendala teknis. Tim kami telah diberitahu dan sedang menangani masalah ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} className="bg-primary text-white hover:bg-blue-700 ">
          Coba Lagi
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
