"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jasaWebFormSchema, type JasaWebFormValues } from '@/lib/validations/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { countries } from '@/lib/countries';

type ServiceCategory = 'jasa_web' | 'produk_digital' | 'custom';
type JasaWebPackage = 'Usaha' | 'Profesional' | 'Eksklusif';

export default function KontakForm() {
    const searchParams = useSearchParams();
    
    const [service, setService] = useState<ServiceCategory>('jasa_web');
    const [jasaWebPackage, setJasaWebPackage] = useState<JasaWebPackage>('Usaha');
    const [handoverOption, setHandoverOption] = useState<string>('Terima Beres (Basic)');
    const [vipLane, setVipLane] = useState<boolean>(false);

    const [submittedData, setSubmittedData] = useState<JasaWebFormValues | null>(null);
    const [waLink, setWaLink] = useState<string>('');
    
    // State untuk Custom Country Dropdown
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // State untuk Custom Service Dropdown
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const serviceDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryOpen(false);
            }
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
                setIsServiceDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JasaWebFormValues>({
        resolver: zodResolver(jasaWebFormSchema),
        defaultValues: { name: '', whatsapp: '', business: '', message: '' }
    });

    useEffect(() => {
        const paket = searchParams.get('paket');
        if (paket === 'katalog') {
            // eslint-disable-next-line
            setService('produk_digital');
        } else if (paket === 'custom') {
            // eslint-disable-next-line
            setService('custom');
        } else if (paket) {
            // eslint-disable-next-line
            setService('jasa_web');
            if (paket === 'profesional') setJasaWebPackage('Profesional');
            else if (paket === 'eksklusif') setJasaWebPackage('Eksklusif');
            else setJasaWebPackage('Usaha');
        }
    }, [searchParams]);

    const onSubmit = async (data: JasaWebFormValues) => {
        let messageText = `Halo Admin RevTech, saya ingin memesan layanan dari website.\n\n`;
        messageText += `*Detail Pemesan*\n`;
        messageText += `Nama: ${data.name}\n`;
        messageText += `No. WA: ${selectedCountry.dial_code}${data.whatsapp}\n`;
        if (data.business) messageText += `Bisnis/Instansi: ${data.business}\n`;
        
        messageText += `\n*Detail Pesanan*\n`;
        messageText += `Layanan: ${service === 'jasa_web' ? 'Jasa Website' : service === 'produk_digital' ? 'Produk Digital' : 'Ide Custom'}\n`;
        
        if (service === 'jasa_web') {
            messageText += `Paket: ${jasaWebPackage}\n`;
            messageText += `Opsi: ${handoverOption}\n`;
            if (vipLane) messageText += `Jalur VIP: Ya\n`;
        }
        if (service === 'custom' && data.reference) {
            messageText += `Referensi: ${data.reference}\n`;
        }
        messageText += `\n*Pesan / Catatan:*\n${data.message}`;

        const waUrl = `https://wa.me/6281290018819?text=${encodeURIComponent(messageText)}`;
        
        setWaLink(waUrl);
        setSubmittedData(data);
        
        // Membuka tab WA langsung
        window.open(waUrl, '_blank');
    };

    if (submittedData) {
        return (
            <motion.div 
                
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-gray-200/40 border border-gray-100 text-center flex flex-col items-center justify-center"
            >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-100">
                    <span className="material-symbols-outlined text-[40px]">check_circle</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Pesanan Berhasil Diterima!</h2>
                <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed max-w-md mb-8">
                    Terima kasih telah memilih RevTech. Tim kami sedang meninjau detail kebutuhan Anda dan akan segera menghubungi via WhatsApp.
                </p>

                {/* Kartu Resi / Bukti Pesanan */}
                <div className="w-full bg-gray-50/50 rounded-2xl p-6 mb-10 text-left border border-gray-100">
                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200/80">
                        <span className="text-gray-500 font-bold text-sm">Status Pesanan</span>
                        <span className="bg-amber-50 text-amber-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Menunggu Tinjauan
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm font-medium">Layanan</span>
                            <span className="text-gray-900 font-bold text-sm text-right">
                                {service === 'jasa_web' ? 'Jasa Website' : service === 'produk_digital' ? 'Produk Digital' : 'Ide Custom'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm font-medium">Nama Lengkap</span>
                            <span className="text-gray-900 font-bold text-sm text-right truncate">{submittedData.name}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm font-medium">No. WhatsApp</span>
                            <span className="text-gray-900 font-bold text-sm text-right">{submittedData.whatsapp}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors flex-1 w-full"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Tanya via WhatsApp
                    </a>
                    <button 
                        onClick={() => {
                            setSubmittedData(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors flex-1 w-full"
                    >
                        Buat Pesanan Baru
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100"
        >
            <div className="mb-10 pb-8 border-b border-gray-100 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Formulir Pemesanan</h2>
                <p className="text-gray-500 font-medium">Pilih kategori layanan dan lengkapi detail pesanan Anda. Kami akan merespons cepat via WhatsApp.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                
                {/* 1. Kategori Layanan */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">1. Pilih Kategori Layanan</label>
                    
                    {/* Desktop: Chips */}
                    <div className="hidden md:flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={() => setService('jasa_web')}
                            className={`py-2 px-4 rounded-lg border text-sm font-bold transition-all duration-200 ${
                                service === 'jasa_web' 
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-md shadow-gray-900/10' 
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Jasa Website
                        </button>
                        <button
                            type="button"
                            disabled
                            className="py-2 px-4 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-sm font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Produk Digital
                        </button>
                        <button
                            type="button"
                            onClick={() => setService('custom')}
                            className={`py-2 px-4 rounded-lg border text-sm font-bold transition-all duration-200 ${
                                service === 'custom' 
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-md shadow-gray-900/10' 
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Ide Custom
                        </button>
                    </div>

                    {/* Mobile: Custom Dropdown */}
                    <div className="md:hidden relative" ref={serviceDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-[15px] font-bold rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all shadow-sm flex items-center justify-between"
                        >
                            <span>
                                {service === 'jasa_web' ? 'Jasa Website' : service === 'custom' ? 'Ide Custom' : 'Pilih Layanan'}
                            </span>
                            <span className={`material-symbols-outlined text-gray-400 transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        
                        <AnimatePresence>
                            {isServiceDropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 z-50 flex flex-col p-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setService('jasa_web'); setIsServiceDropdownOpen(false); }}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-bold text-left transition-colors ${service === 'jasa_web' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                    >
                                        Jasa Website
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="flex items-center gap-2 px-3 py-3 rounded-lg text-[15px] font-bold text-left text-gray-400 bg-gray-50/50 cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        Produk Digital (Segera Hadir)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setService('custom'); setIsServiceDropdownOpen(false); }}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-bold text-left transition-colors ${service === 'custom' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                    >
                                        Ide Custom
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Optional: Paket Website (Only if Jasa Web is selected) */}
                <AnimatePresence>
                    {service === 'jasa_web' && (
                        <motion.div 
                             
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-10"
                        >
                            <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Paket Website</label>
                                    <div className="relative">
                                        <select 
                                            value={jasaWebPackage}
                                            onChange={(e) => setJasaWebPackage(e.target.value as JasaWebPackage)}
                                            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Usaha">Paket Usaha</option>
                                            <option value="Profesional">Paket Profesional</option>
                                            <option value="Eksklusif">Paket Eksklusif</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Opsi Serah Terima</label>
                                    <div className="relative">
                                        <select 
                                            value={handoverOption}
                                            onChange={(e) => setHandoverOption(e.target.value)}
                                            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Terima Beres (Basic)">Terima Beres (Basic)</option>
                                            <option value="Terima Beres (Plus)">Terima Beres (Plus)</option>
                                            <option value="Sistem Mandiri">Sistem Mandiri (Source Code)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="vipLane" 
                                        checked={vipLane}
                                        onChange={(e) => setVipLane(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                                    />
                                    <label htmlFor="vipLane" className="text-sm font-bold text-gray-700 cursor-pointer">
                                        Gunakan Jalur VIP (Percepatan rilis + Biaya 30%)
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Data Diri */}
                <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-700 mb-4">2. Data Diri & Profil</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Input 
                                type="text" 
                                {...register("name")}
                                className="bg-gray-50 text-gray-900 border-gray-200 focus-visible:ring-gray-900 py-6 px-5" 
                                placeholder="Nama Lengkap Anda *" 
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1 font-medium">{errors.name.message}</p>}
                        </div>

                        <div>
                            <div className="flex bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-gray-900 transition-all hover:border-gray-300 shadow-sm group">
                                <div className="relative flex shrink-0" ref={countryDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                                        className="bg-transparent border-r border-gray-200 rounded-l-xl text-gray-900 font-bold pl-4 pr-9 h-full flex items-center justify-center gap-2 outline-none group-hover:bg-gray-100 transition-colors"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} alt={selectedCountry.code} className="w-5 h-auto object-contain rounded-sm shadow-sm" />
                                        <span className="text-[14px]">{selectedCountry.dial_code}</span>
                                    </button>
                                    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-gray-500 pointer-events-none z-10 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                    
                                    <AnimatePresence>
                                        {isCountryOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-[calc(100%+8px)] left-0 w-64 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 z-50 flex flex-col p-1 custom-scrollbar"
                                            >
                                                {countries.map(country => (
                                                    <button
                                                        key={country.code}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCountry(country);
                                                            setIsCountryOpen(false);
                                                        }}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${selectedCountry.code === country.code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.code} loading="lazy" className="w-5 h-auto object-contain rounded-sm shadow-sm" />
                                                        <span>{country.name}</span>
                                                        <span className={`ml-auto ${selectedCountry.code === country.code ? 'text-blue-500' : 'text-gray-500'}`}>{country.dial_code}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <Input 
                                    type="tel" 
                                    {...register("whatsapp")}
                                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-6 px-5 rounded-l-none text-gray-900 placeholder:text-gray-400 shadow-none" 
                                    placeholder="8123456... *" 
                                />
                            </div>
                            {errors.whatsapp && <p className="text-red-500 text-sm mt-1 font-medium">{errors.whatsapp.message}</p>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <Input 
                                type="text" 
                                {...register("business")}
                                className="bg-gray-50 text-gray-900 border-gray-200 focus-visible:ring-gray-900 py-6 px-5" 
                                placeholder="Nama Bisnis / Instansi (Opsional)" 
                            />
                            {errors.business && <p className="text-red-500 text-sm mt-1 font-medium">{errors.business.message}</p>}
                        </div>
                    </div>
                </div>

                {/* 3. Detail Kebutuhan */}
                <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-700 mb-4">3. Detail Pemesanan / Kebutuhan Tambahan</label>
                    
                    <AnimatePresence>
                        {service === 'custom' && (
                            <motion.div
                                
                                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <Input 
                                    type="text" 
                                    {...register("reference")}
                                    className="bg-gray-50 text-gray-900 border-gray-200 focus-visible:ring-gray-900 py-6 px-5" 
                                    placeholder="Link Referensi / Contoh Produk (Opsional, cth: www.contoh.com)" 
                                />
                                {errors.reference && <p className="text-red-500 text-sm mt-1 font-medium">{errors.reference.message}</p>}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Textarea 
                        {...register("message")}
                        rows={5} 
                        className="bg-gray-50 text-gray-900 border-gray-200 focus-visible:ring-gray-900 resize-none p-5" 
                        placeholder={
                            service === 'jasa_web' 
                                ? "Deskripsikan referensi desain, fitur khusus, atau pertanyaan seputar pemesanan website Anda..." 
                                : service === 'produk_digital'
                                ? "Sebutkan nama produk digital atau spesifikasi aset yang ingin Anda pesan..."
                                : "Ceritakan ide sistem, web app, atau solusi custom yang Anda butuhkan secara singkat..."
                        } 
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1 font-medium">{errors.message.message}</p>}
                </div>

                <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-6 text-base bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3 group shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-transform">
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">send</span> 
                        {isSubmitting ? "Memproses..." : "Kirim Pesanan"}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}
