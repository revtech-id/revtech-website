"use client";

import { motion } from 'framer-motion';

interface HandoverSimulation {
    label: string;
    value: string;
    total?: boolean;
}

interface HandoverOption {
    title: string;
    desc: string;
    simulations?: HandoverSimulation[];
    simNote?: string;
    price?: string;
    subprice?: string;
    border: string;
    badge?: string;
    bgSim?: string;
}

export default function HandoverOptions() {
    return (
        <section className="py-16 lg:py-24 bg-gray-50/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Opsi Serah Terima</h3>
                    <p className="text-gray-600 font-medium max-w-2xl mx-auto text-sm md:text-base">
                        Pilih metode penyerahan proyek yang paling sesuai dengan kebutuhan Anda.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left items-stretch">
                    {(
                        [
                        {
                            title: 'Terima Beres (Basic)',
                            desc: 'Website di-hosting di server kami. Biaya mencakup perpanjangan sewa server dan domain. Revisi konten dikenakan biaya terpisah.',
                            simulations: [
                                { label: 'Domain .my.id', value: 'Rp 100rb/thn' },
                                { label: 'Domain .com', value: 'Rp 300rb/thn' },
                                { label: 'Domain .co.id', value: 'Rp 450rb/thn' },
                            ],
                            simNote: '*Harga perpanjangan mulai tahun ke-2',
                            border: 'border-gray-200 shadow-sm'
                        },
                        {
                            title: 'Terima Beres (Plus)',
                            desc: 'Infrastruktur dikelola penuh. Sudah mencakup pemeliharaan server, keamanan, serta fasilitas gratis revisi minor 1x setiap bulannya.',
                            simulations: [
                                { label: 'Maintenance', value: 'Rp 600rb/thn' },
                                { label: '+ Domain (.com)', value: 'Rp 300rb/thn' },
                                { label: 'Total Estimasi', value: 'Rp 900rb/thn', total: true },
                            ],
                            simNote: '*Tagihan pertama dimulai 3 bulan setelah rilis',
                            border: 'border-gray-200 shadow-sm'
                        },
                        {
                            title: 'Sistem Mandiri',
                            desc: 'Kami menyerahkan source code mentah. Instalasi server, domain, dan pemeliharaan menjadi tanggung jawab Anda.',
                            simulations: [
                                { label: 'Source Code', value: 'Rp 0' },
                                { label: 'Maintenance', value: 'Rp 0' },
                                { label: 'Total Tagihan', value: 'Gratis', total: true },
                            ],
                            simNote: '*Bebas tagihan rutin dari kami. Server dikelola mandiri.',
                            border: 'border-gray-200 shadow-sm'
                        }
                    ] as HandoverOption[]).map((opt, i) => (
                        <motion.div
                            
                            
                            
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            key={i}
                            className={`flex flex-col h-full p-8 md:p-5 lg:p-8 rounded-3xl bg-white border hover-card ${opt.border}`}
                        >
                            {opt.badge && (
                                <div className="inline-block bg-blue-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-4 w-fit">
                                    {opt.badge}
                                </div>
                            )}

                            <h4 className={`text-xl font-bold text-gray-900 mb-4 ${!opt.badge ? 'mt-2' : ''}`}>
                                {opt.title}
                            </h4>
                            
                            <p className="text-[14px] text-gray-600 leading-relaxed font-medium flex-1">
                                {opt.desc}
                            </p>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                {opt.simulations ? (
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Simulasi Biaya</p>
                                        <div className={`p-4 rounded-xl border ${opt.bgSim || 'bg-gray-50 border-gray-100'} space-y-3`}>
                                            {opt.simulations.map((sim: HandoverSimulation, idx: number) => (
                                                <div key={idx} className={`flex justify-between items-center text-[13px] ${sim.total ? 'pt-3 mt-3 border-t border-black/10' : ''}`}>
                                                    <span className={sim.total ? 'font-bold text-gray-900' : 'text-gray-500 font-medium'}>{sim.label}</span>
                                                    <span className={sim.total ? 'font-black text-gray-900' : 'text-gray-900 font-bold'}>{sim.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {opt.simNote && <p className="text-[12px] text-gray-400 mt-3 font-medium">{opt.simNote}</p>}
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xl font-black text-gray-900 block mb-1">{opt.price}</span>
                                        <span className="block text-[13px] font-medium text-gray-500">{opt.subprice}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
