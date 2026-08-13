"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jasaWebFormSchema, type JasaWebFormValues } from '@/lib/validations/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { countries } from '@/lib/countries';
import { CountrySelector } from '@/components/ui/CountrySelector';

type ServiceCategory = '' | 'jasa_web' | 'produk_digital' | 'custom';
type JasaWebPackage = 'Usaha' | 'Profesional' | 'Eksklusif';

export default function KontakForm() {
    const searchParams = useSearchParams();
    
    const [service, setService] = useState<ServiceCategory>('');
    const [jasaWebPackage, setJasaWebPackage] = useState<JasaWebPackage>('Usaha');

    const [submittedData, setSubmittedData] = useState<JasaWebFormValues | null>(null);
    const [waLink, setWaLink] = useState<string>('');
    
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<JasaWebFormValues>({
        resolver: zodResolver(jasaWebFormSchema),
        defaultValues: { name: '', whatsapp: '', business: '', message: '', productName: '' }
    });

    const handleReset = () => {
        reset();
        setService('');
        setJasaWebPackage('Usaha');
        setSelectedCountry(countries[0]);
    };

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
        let cleanWhatsApp = data.whatsapp;
        if (selectedCountry.code === 'ID') {
            cleanWhatsApp = cleanWhatsApp.replace(/^0+/, '');
        }

        let messageText = `Halo Admin RevTech, saya baru saja membuat pesanan melalui website dan ingin melakukan konfirmasi.\n\n`;
        messageText += `Berikut adalah detail pesanan saya:\n\n`;
        messageText += `*Detail Pemesan*\n`;
        messageText += `Nama: ${data.name}\n`;
        messageText += `No. WA: ${selectedCountry.dial_code}${cleanWhatsApp}\n`;
        if (data.business) messageText += `Bisnis/Instansi: ${data.business}\n`;
        
        messageText += `\n*Detail Pesanan*\n`;
        messageText += `Layanan: ${service === 'jasa_web' ? 'Jasa Website' : service === 'produk_digital' ? 'Produk Digital' : 'Ide Custom'}\n`;
        
        if (service === 'jasa_web') {
            messageText += `Paket: ${jasaWebPackage}\n`;
        } else if (service === 'produk_digital' && data.productName) {
            messageText += `Nama Produk: ${data.productName}\n`;
        }
        if (service === 'custom' && data.reference) {
            messageText += `Referensi: ${data.reference}\n`;
        }
        messageText += `\n*Pesan / Catatan:*\n${data.message}`;

        const waUrl = `https://wa.me/6281290018819?text=${encodeURIComponent(messageText)}`;
        
        setWaLink(waUrl);
        setSubmittedData(data);
        
        // Simpan otomatis ke Inbox (Local Storage simulasi)
        try {
            let basePrice = 0;
            if (service === 'jasa_web') {
                if (jasaWebPackage === 'Usaha') basePrice = 499000;
                else if (jasaWebPackage === 'Profesional') basePrice = 1499000;
                else if (jasaWebPackage === 'Eksklusif') basePrice = 5000000;
            } else if (service === 'produk_digital') {
                basePrice = 150000;
            }

            
            const newLead = {
                id: `LD-${Math.floor(10000 + Math.random() * 90000)}`,
                name: data.name,
                phone: `${selectedCountry.dial_code.replace('+', '')}${cleanWhatsApp}`,
                company: data.business || "-",
                service: service === 'jasa_web' ? 'Jasa Website' : service === 'produk_digital' ? 'Produk Digital' : 'Custom Project',
                serviceDetail: service === 'jasa_web' ? `Paket ${jasaWebPackage}` : service === 'produk_digital' ? (data.productName || "") : service === 'custom' ? (data.reference || "") : "",
                budget: basePrice > 0 ? `Rp ${basePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : "-",
                message: data.message,
                status: "new",
                createdAt: new Date().toISOString(),
                handover: "",
                referenceLink: service === 'custom' ? (data.reference || "") : ""
            };

            const saved = localStorage.getItem("revtech_inbox");
            let inboxData = [];
            if (saved) {
                inboxData = JSON.parse(saved);
            }
            inboxData.unshift(newLead);
            localStorage.setItem("revtech_inbox", JSON.stringify(inboxData));
            
            // Log activity for notification popover
            import("@/lib/activityLog").then(({ logActivity }) => {
              logActivity({
                type: "lead_created",
                title: "Pesanan Baru dari Website!",
                description: `${data.name}${data.business ? ` (${data.business})` : ""} mengisi formulir untuk layanan ${service === 'jasa_web' ? `Jasa Website - Paket ${jasaWebPackage}` : service === 'produk_digital' ? 'Produk Digital' : 'Ide Custom'}.`,
                user: "System",
              });
            });
        } catch (e) {
            console.error("Failed to save to inbox:", e);
        }

        // Tidak ada auto-redirect ke WA berdasarkan permintaan klien
    };

    if (submittedData) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-gray-200 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-100">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil Diterima!</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-md mb-8">
                    Tim kami sedang meninjau pesanan Anda. Butuh respons lebih cepat? Silakan konfirmasi manual via tombol WhatsApp di bawah.
                </p>

                {/* Kartu Resi / Bukti Pesanan */}
                <div className="w-full bg-gray-50/50 rounded-xl p-5 mb-8 text-left border border-gray-100">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/80">
                        <span className="text-gray-500 font-medium text-sm">Status Pesanan</span>
                        <span className="bg-amber-50 text-amber-600 font-medium px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Menunggu Tinjauan
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm">Layanan</span>
                            <span className="text-gray-900 font-medium text-sm text-right">
                                {service === 'jasa_web' ? 'Jasa Website' : service === 'produk_digital' ? 'Produk Digital' : 'Ide Custom'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm">Nama Lengkap</span>
                            <span className="text-gray-900 font-medium text-sm text-right truncate">{submittedData.name}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 text-sm">No. WhatsApp</span>
                            <span className="text-gray-900 font-medium text-sm text-right">
                                {selectedCountry.code === 'ID' 
                                    ? `0${submittedData.whatsapp.replace(/^0+/, '')}`
                                    : `${selectedCountry.dial_code} ${submittedData.whatsapp}`
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors flex-1 w-full"
                    >
                        Konfirmasi via WA
                    </a>
                    <button 
                        onClick={() => {
                            setSubmittedData(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors flex-1 w-full"
                    >
                        Buat Pesanan Baru
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="form-pesanan" className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-sm scroll-mt-24">
            <div className="mb-8 border-b border-gray-100 pb-6 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulir Pemesanan</h2>
                <p className="text-gray-500 text-sm font-medium">Lengkapi detail pesanan Anda. Kami akan merespons cepat via WhatsApp.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Row 1: Nama Lengkap & WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-2">Nama Lengkap *</label>
                        <Input 
                            type="text" 
                            {...register("name")}
                            className="bg-white text-gray-900 border-gray-200 focus-visible:ring-blue-500 rounded-lg py-2.5 px-3 h-auto shadow-sm" 
                            placeholder="Masukkan nama lengkap" 
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-2">Nomor WhatsApp *</label>
                        <div className="flex bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm">
                            <CountrySelector 
                                selected={selectedCountry} 
                                onSelect={setSelectedCountry} 
                                theme="public" 
                            />
                            <Input 
                                type="tel" 
                                {...register("whatsapp")}
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                }}
                                className="flex-1 bg-transparent text-gray-900 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-2.5 px-3 rounded-l-none shadow-none h-auto" 
                                placeholder={selectedCountry.code === 'ID' ? "8123456..." : "123456789..."}  
                            />
                        </div>
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                    </div>
                </div>

                {/* Row 2: Kategori Layanan & Paket Website (conditional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-2">Kategori Layanan</label>
                        <select 
                            value={service}
                            onChange={(e) => setService(e.target.value as ServiceCategory)}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg py-3 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        >
                            <option value="" disabled>- Pilih Layanan -</option>
                            <option value="jasa_web">Jasa Website</option>
                            <option value="produk_digital">Produk Digital</option>
                            <option value="custom">Ide Custom</option>
                        </select>
                    </div>

                    {service === 'jasa_web' && (
                        <div>
                            <label className="block text-[13px] font-medium text-gray-600 mb-2">Paket Website</label>
                            <select 
                                value={jasaWebPackage}
                                onChange={(e) => setJasaWebPackage(e.target.value as JasaWebPackage)}
                                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg py-3 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            >
                                <option value="Usaha">Paket Usaha</option>
                                <option value="Profesional">Paket Profesional</option>
                                <option value="Eksklusif">Paket Eksklusif</option>
                            </select>
                        </div>
                    )}
                    
                    {service === 'produk_digital' && (
                        <div>
                            <label className="block text-[13px] font-medium text-gray-600 mb-2">Nama Produk <span className="text-gray-400 font-normal">(Opsional)</span></label>
                            <Input 
                                type="text" 
                                {...register("productName")}
                                className="bg-white text-gray-900 border-gray-200 focus-visible:ring-blue-500 rounded-lg py-2.5 px-3 h-auto shadow-sm" 
                                placeholder="Masukkan nama produk" 
                            />
                            {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName.message}</p>}
                        </div>
                    )}
                </div>

                {/* Row 3: Bisnis / Instansi */}
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-2">Bisnis / Instansi <span className="text-gray-400 font-normal">(Opsional)</span></label>
                    <Input 
                        type="text" 
                        {...register("business")}
                        className="bg-white text-gray-900 border-gray-200 focus-visible:ring-blue-500 rounded-lg py-2.5 px-3 h-auto shadow-sm" 
                        placeholder="Masukkan nama bisnis atau instansi (jika ada)" 
                    />
                    {errors.business && <p className="text-red-500 text-xs mt-1">{errors.business.message}</p>}
                </div>

                {/* Optional: Link Referensi (only if Custom Project) */}
                {service === 'custom' && (
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-2">Link Referensi <span className="text-gray-400 font-normal">(Opsional)</span></label>
                        <Input 
                            type="text" 
                            {...register("reference")}
                            className="bg-white text-gray-900 border-gray-200 focus-visible:ring-blue-500 rounded-lg py-2.5 px-3 h-auto shadow-sm" 
                            placeholder="Contoh: www.referensi.com" 
                        />
                        {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference.message}</p>}
                    </div>
                )}

                {/* Row 4: Pesan / Detail Kebutuhan */}
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-2">Pesan / Detail Kebutuhan</label>
                    <Textarea 
                        {...register("message")}
                        rows={4} 
                        className="bg-white text-gray-900 border-gray-200 focus-visible:ring-blue-500 rounded-lg resize-none py-2.5 px-3 shadow-sm" 
                        placeholder="Ceritakan detail pesanan, kebutuhan fitur, atau pertanyaan Anda di sini..." 
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                {/* Footer Buttons */}
                <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end items-center gap-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors"
                    >
                        Batal
                    </button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium h-auto shadow-none">
                        {isSubmitting ? "Memproses..." : "Kirim Pesanan"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
