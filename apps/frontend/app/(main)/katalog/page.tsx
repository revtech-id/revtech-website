import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Katalog Digital RevTech | Segera Hadir",
    description: "Koleksi sistem dan website siap pakai. Sedang disiapkan.",
};

export default function Katalog() {
    return (
        <div className="pt-24 pb-24 bg-white min-h-[80vh] flex flex-col items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
                
                {/* Empty / Locked State Card */}
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center max-w-2xl mx-auto transition-colors hover:border-gray-300 hover:bg-gray-50/50">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
                        <span className="material-symbols-outlined text-3xl">
                            lock
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
                        Katalog Produk Digital
                    </h1>
                    <p className="text-gray-500 font-medium text-base md:text-lg max-w-md mx-auto leading-relaxed">
                        Halaman ini sedang disiapkan. Kami sedang menyusun dan mengkurasi koleksi sistem siap pakai khusus untuk Anda.
                    </p>
                </div>

            </div>
        </div>
    );
}
