"use client";

import { motion } from 'framer-motion';

export default function KontakHeader() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 max-w-2xl mx-auto"
        >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Hubungi <span className="text-blue-600">Kami.</span></h1>
            <p className="text-lg text-gray-600 font-medium">Ceritakan ide Anda, dan mari wujudkan dalam bentuk digital. Kami siap mendengar dan memberikan solusi terbaik.</p>
        </motion.div>
    );
}
