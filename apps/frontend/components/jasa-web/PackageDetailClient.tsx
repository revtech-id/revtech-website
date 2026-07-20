"use client";

import { motion } from 'framer-motion';
import { PricingPlan } from '@/data/pricing';
import { CheckCircle2, XCircle, Lightbulb, LayoutTemplate, Layers, Settings, ExternalLink } from 'lucide-react';

interface PackageDetailClientProps {
    plan: PricingPlan;
}

export default function PackageDetailClient({ plan }: PackageDetailClientProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* HERO SECTION - SUPER SIMPLE */}
            <section className="pt-32 pb-16 px-6 border-b border-gray-200 bg-white text-center">
                <motion.div 
                     
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4 }}
                    className="max-w-3xl mx-auto flex flex-col items-center"
                >
                    {plan.promoBadge && (
                        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                            {plan.promoBadge}
                        </div>
                    )}
                    <h1 className="text-4xl md:text-[2.5rem] lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Paket <span className="text-blue-600">{plan.name.replace('Paket ', '')}</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
                        {plan.longDescription || plan.description}
                    </p>
                </motion.div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">


                
                {/* EDUCATIONAL DETAILS SECTION */}
                {plan.detailedExplanations && plan.detailedExplanations.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-blue-500" />
                            Memahami Lebih Dalam
                        </h2>
                        
                        <div className="space-y-6">
                            {plan.detailedExplanations.map((exp, idx) => (
                                <motion.div 
                                    key={idx}
                                    
                                    
                                    
                                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                                    className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{exp.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                        {exp.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* KESESUAIAN & ANATOMI PAKET */}
                {(plan.idealFor && plan.notIdealFor) && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Anatomi & Kesesuaian Paket
                        </h2>
                        
                        <motion.div 
                            
                            
                            
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col md:flex-row"
                        >
                            {/* Visual Anatomi */}
                            <div className="bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-8 flex flex-col items-center justify-center md:w-1/3 shrink-0 text-center">
                                {plan.id === 'usaha' && <LayoutTemplate className="w-16 h-16 text-blue-500 mb-4" />}
                                {plan.id === 'profesional' && <Layers className="w-16 h-16 text-blue-500 mb-4" />}
                                {plan.id === 'eksklusif' && <Settings className="w-16 h-16 text-blue-500 mb-4" />}
                                <h3 className="font-bold text-gray-900 mb-1">
                                    {plan.id === 'usaha' && "1 Halaman Memanjang"}
                                    {plan.id === 'profesional' && "Multi-Halaman Terhubung"}
                                    {plan.id === 'eksklusif' && "Sistem & Dashboard Kustom"}
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Struktur Dasar</p>
                            </div>
                            
                            {/* Cocok & Tidak Cocok */}
                            <div className="p-6 md:p-8 flex flex-col gap-6 w-full">
                                <div>
                                    <h4 className="flex items-center gap-2 font-bold text-green-700 mb-3">
                                        <CheckCircle2 className="w-5 h-5" /> Sangat Cocok Untuk:
                                    </h4>
                                    <ul className="space-y-2">
                                        {plan.idealFor.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="text-green-500 font-bold">•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="flex items-center gap-2 font-bold text-red-600 mb-3">
                                        <XCircle className="w-5 h-5" /> Kurang Cocok Untuk:
                                    </h4>
                                    <ul className="space-y-2">
                                        {plan.notIdealFor.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-500 flex items-start gap-2">
                                                <span className="text-red-400 font-bold">•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* FULL FEATURES CHECKLIST */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Daftar Spesifikasi & Fitur Teknis
                    </h2>
                    
                    <motion.div 
                        
                        
                        
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                            {plan.fullFeatures ? plan.fullFeatures.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        {feature.included ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-300" />
                                        )}
                                    </div>
                                    <span className={`text-sm md:text-base ${feature.included ? 'text-gray-800 font-medium' : 'text-gray-400 line-through'}`}>
                                        {feature.name}
                                    </span>
                                </div>
                            )) : (
                                <div className="col-span-full text-center text-gray-500 text-sm py-4">
                                    Detail fitur teknis sedang disiapkan.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* DEMO SECTION - Ditaruh Paling Bawah */}
                <section>
                    <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-6 md:px-10 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                            <div className="flex flex-col w-full text-left">
                                <span className="text-[13px] font-semibold text-gray-500 mb-1">Live Preview {plan.name}</span>
                                <span className="text-base md:text-lg font-bold text-gray-900">
                                    Ingin tahu gambaran website-nya seperti apa?
                                </span>
                            </div>
                        <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                            <button className="w-full md:w-auto bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 text-sm shadow-md hover:shadow-lg">
                                Lihat Live Demo 
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>
                
            </div>
        </div>
    );
}
