"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { pricingPlans as defaultPlans } from '@/data/pricing';
import type { PricingPlan } from '@/data/pricing';
import { Button } from '@/components/ui/Button';
import { fadeUpVariant, staggerContainerVariant, defaultViewport } from '@/lib/animations';
import { calculateDiscount } from '@/lib/utils';


export default function PricingCards() {
    const [showEksklusifToast, setShowEksklusifToast] = useState(false);
    const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans);

    useEffect(() => {
        const load = () => {
            const saved = localStorage.getItem('revtech_jasa_web_plans');
            if (saved) {
                try { 
                    const parsed = JSON.parse(saved) as PricingPlan[];
                    const merged = defaultPlans.map(dp => {
                        const matching = parsed.find(p => p.id === dp.id);
                        return matching ? { ...dp, ...matching } : dp;
                    });
                    setPlans(merged); 
                } catch (e) {}
            }
        };
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'revtech_jasa_web_plans') load();
        };
        
        load();
        window.addEventListener('jasa-web-updated', load);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('jasa-web-updated', load);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    // Dummy trigger for demonstration - if you ever want to show it.
    // useEffect(() => {
    //     setShowEksklusifToast(true);
    // }, []);

    useEffect(() => {
        if (showEksklusifToast) {
            const timer = setTimeout(() => {
                setShowEksklusifToast(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showEksklusifToast]);

    return (
        <>
            <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainerVariant}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 lg:gap-8 mb-12 max-w-md md:max-w-none mx-auto"
        >
                {plans.map((plan, idx) => {
                    const currentPrice = plan.basicPrice;
                    const currentFeatures = plan.basicFeatures;

                    return (
                        <motion.div 
                            key={plan.id} 
                            variants={fadeUpVariant}
                            className={`rounded-[32px] p-[3px] transition-[box-shadow,border-color] duration-500 relative flex flex-col ${
                                plan.popular 
                                    ? 'bg-blue-400 shadow-2xl shadow-blue-600/40 lg:scale-105 z-10' 
                                    : 'bg-white border border-gray-200 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-gray-300'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-[10px] md:text-[9px] lg:text-[11px] sm:text-xs font-black px-4 md:px-3 lg:px-5 py-1 rounded-full shadow-sm tracking-widest z-10 uppercase whitespace-nowrap">
                                    BEST SELLER
                                </div>
                            )}
                            <div className={`rounded-[29px] p-8 sm:p-10 md:p-5 lg:p-10 h-full flex flex-col ${plan.popular ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
                                <h4 className="text-2xl md:text-xl lg:text-2xl font-black mb-3 md:mb-2 lg:mb-3 mt-2 tracking-tight">{plan.name}</h4>
                                <p className={`text-xs sm:text-[13px] md:text-[13px] lg:text-sm mb-8 md:mb-5 lg:mb-8 font-medium leading-relaxed ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>{plan.description}</p>

                                <div className="mb-8 md:mb-5 lg:mb-8 flex flex-col gap-1 h-[48px] justify-end">
                                    {plan.originalPrice && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm md:text-xs lg:text-sm text-gray-400 line-through font-bold">{plan.originalPrice}</span>
                                            {(() => {
                                                const discount = calculateDiscount(plan.basicPrice, plan.originalPrice);
                                                return discount ? (
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${plan.popular ? 'bg-white text-red-600 shadow-sm' : 'bg-red-100 text-red-600'}`}>
                                                        {discount}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}
                                    <span className={`font-black tracking-tighter leading-none whitespace-nowrap text-[32px] md:text-2xl lg:text-[28px] xl:text-[36px] ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                        {currentPrice}
                                    </span>
                                </div>
                                
                                <ul className={`flex flex-col gap-y-3 mb-8 flex-1 ${plan.popular ? 'text-blue-50' : 'text-gray-700'}`}>
                                    {currentFeatures?.map((feature, fIdx) => (
                                        <li key={fIdx} className={`flex items-start gap-2 text-[13px] leading-tight ${!feature.included ? (plan.popular ? 'text-blue-300/50' : 'text-gray-400 line-through') : ''}`}>
                                            <span className={`material-symbols-outlined text-[16px] shrink-0 mt-[1px] ${feature.included ? (plan.popular ? 'text-white' : 'text-primary') : 'opacity-50'}`}>
                                                {feature.included ? 'check_circle' : 'cancel'}
                                            </span> 
                                            {feature.name}
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    <Button 
                                        asChild 
                                        size="lg" 
                                        variant={plan.popular ? "secondary" : "default"} 
                                        className={`w-full text-sm font-bold gap-2 ${plan.popular ? '!bg-white !text-blue-600 hover:!bg-blue-50 shadow-lg hover:shadow-xl' : ''}`}
                                    >
                                        <Link href={`/kontak?paket=${plan.id}`}>
                                            Pesan Sekarang
                                        </Link>
                                    </Button>
                                    <Link 
                                        href={`/jasa-web/${plan.id}`} 
                                        className={`text-center text-xs font-bold mt-2 hover:underline transition-all ${plan.popular ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                                    >
                                        Pelajari Detail & Fitur Paket
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
        </motion.div>

            {/* Eksklusif Toast Notification */}
            <AnimatePresence>
                {showEksklusifToast && (
                    <motion.div 
                        
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-md border border-gray-700">
                            <div className="bg-yellow-400/20 text-yellow-400 rounded-full w-10 h-10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined">workspace_premium</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold mb-1 text-yellow-400">Standar Kualitas Eksklusif</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">Website RevTech yang sedang Anda akses ini adalah salah satu standar kualitas Paket Eksklusif kami.</p>
                            </div>
                            <button onClick={() => setShowEksklusifToast(false)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
