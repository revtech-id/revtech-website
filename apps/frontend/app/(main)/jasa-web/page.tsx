"use client";

import PricingCards from '@/components/harga/PricingCards';

import WorkflowSteps from '@/components/harga/WorkflowSteps';
import HandoverOptions from '@/components/harga/HandoverOptions';

import AfterSalesSupport from '@/components/harga/AfterSalesSupport';
import AICtaBanner from '@/components/harga/AICtaBanner';

import { motion } from 'framer-motion';

export default function Harga() {
    return (
        <div className="pt-24 lg:pt-32 bg-gray-50/50 relative overflow-hidden">
            {/* Halaman Jasa Web tanpa dekorasi glow khusus agar seragam dengan halaman lain */}

            {/* 1. Paket Layanan & Harga */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 relative z-10">
                <div className="text-center mb-12 lg:mb-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
                        Jelajahi Pilihan <span className="block md:inline text-blue-600">Paket Kami</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">Temukan solusi digital yang paling tepat untuk kebutuhan Anda. Fitur lengkap, harga transparan.</p>
                </div>
                <PricingCards />
            </div>

            {/* 2. Opsi Serah Terima Sistem */}
            <HandoverOptions />

            {/* 5. Cara Kerja & Pembayaran */}
            <WorkflowSteps />

            {/* 6. Dukungan Pasca-Rilis (Biaya Modifikasi) */}
            <AfterSalesSupport />

            {/* 7. Banner CTA Chatbot AI Pengganti FAQ */}
            <AICtaBanner />
        </div>
    );
}
