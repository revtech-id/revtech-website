"use client";
import { motion } from 'framer-motion';

export default function CustomSystemAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute w-3/4 h-3/4 bg-slate-100 rounded-full blur-2xl opacity-40"></div>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Central Canvas/Screen */}
                <motion.div 
                    className="absolute z-10 w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">architecture</span>
                    </div>
                </motion.div>

                {/* Floating Elements / Blocks snapping together */}
                <motion.div 
                    className="absolute z-20 top-4 left-4 w-12 h-12 bg-slate-700 rounded-xl shadow-md flex items-center justify-center text-white"
                    animate={{ 
                        x: [0, 20, 0],
                        y: [0, 20, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="material-symbols-outlined text-xl">widgets</span>
                </motion.div>

                <motion.div 
                    className="absolute z-20 bottom-4 right-4 w-14 h-14 bg-slate-800 rounded-xl shadow-md flex items-center justify-center text-white"
                    animate={{ 
                        x: [0, -20, 0],
                        y: [0, -20, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <span className="material-symbols-outlined text-2xl">settings</span>
                </motion.div>

                <motion.div 
                    className="absolute z-20 bottom-8 left-0 w-10 h-10 bg-slate-500 rounded-xl shadow-md flex items-center justify-center text-white"
                    animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 15, 0]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <span className="material-symbols-outlined text-lg">code</span>
                </motion.div>
                
                <motion.div 
                    className="absolute z-0 top-0 right-2 w-16 h-16 bg-slate-100 rounded-full"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                />
            </div>
        </div>
    );
}
