"use client";

import { motion } from 'framer-motion';

export default function AffiliateDisclaimer() {
    return (
        <motion.div 
            
            
            
            className="flex items-start gap-2"
        >
            <span className="material-symbols-outlined text-gray-300 mt-0.5 text-base">info</span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed italic">
                <strong>Transparansi:</strong> Artikel ini mungkin memuat tautan afiliasi. Jika Anda mendaftar melalui tautan tersebut, kami mungkin menerima sedikit komisi tanpa ada biaya tambahan sekecil apapun bagi Anda. Dukungan ini sangat membantu kami untuk terus menulis artikel yang bermanfaat.
            </p>
        </motion.div>
    );
}
