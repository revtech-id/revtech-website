"use client";
import { motion } from 'framer-motion';

export default function CatalogAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute w-3/4 h-3/4 bg-blue-100 rounded-full blur-2xl opacity-40"></div>

            {/* Catalog Grid Cards */}
            <div className="relative w-3/4 h-3/4 grid grid-cols-2 gap-3 p-4">
                <motion.div
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="h-1/2 bg-blue-50 w-full relative">
                        <div className="absolute bottom-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                        </div>
                    </div>
                    <div className="h-1/2 p-2 flex flex-col gap-1.5 justify-center">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="h-1/2 bg-sky-50 w-full relative">
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-sky-200 rounded-full"></div>
                        </div>
                    </div>
                    <div className="h-1/2 p-2 flex flex-col gap-1.5 justify-center">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-2/3"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <div className="h-1/2 bg-indigo-50 w-full relative">
                        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-md flex items-center justify-center">
                            <div className="w-3 h-3 bg-indigo-200 rounded-sm"></div>
                        </div>
                    </div>
                    <div className="h-1/2 p-2 flex flex-col gap-1.5 justify-center">
                        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white"
                    animate={{ y: [0, 12, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-blue-900 text-sm">add</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                </motion.div>
            </div>

            {/* Interactive floating cursor element */}
            <motion.div
                className="absolute z-20 w-8 h-8 rounded-full border-2 border-blue-900 bg-blue-900/20 backdrop-blur-sm flex items-center justify-center"
                animate={{
                    x: [30, -30, 20, 30],
                    y: [20, -10, -40, 20],
                    scale: [1, 1.2, 0.9, 1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-1.5 h-1.5 bg-blue-900 rounded-full"></div>
            </motion.div>
        </div>
    );
}
