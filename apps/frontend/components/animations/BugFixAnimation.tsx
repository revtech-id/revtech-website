"use client";

export default function BugFixAnimation() {
  return (
    <div className="relative w-full h-full min-h-[150px] lg:min-h-[400px] flex items-center justify-center bg-transparent">
      <style jsx>{`
        @keyframes floatRobot {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulseLaser {
            0%, 100% { opacity: 0.3; stroke-width: 2; }
            50% { opacity: 1; stroke-width: 6; filter: drop-shadow(0 0 8px cyan); }
        }
        @keyframes shakeBug {
            0%, 100% { transform: translateX(0); color: #ef4444; }
            25% { transform: translateX(-2px) rotate(-10deg); color: #f87171; }
            75% { transform: translateX(2px) rotate(10deg); color: #fca5a5; }
        }
        @keyframes codeScroll {
            to { stroke-dashoffset: -40; }
        }
        .anim-robot { animation: floatRobot 4s ease-in-out infinite; }
        .anim-laser { animation: pulseLaser 2s infinite; stroke: #22d3ee; }
        .anim-bug { animation: shakeBug 0.5s infinite; }
        .anim-code { stroke-dasharray: 4 8; animation: codeScroll 1s linear infinite; }
      `}</style>
      
      <div className="relative w-40 h-40 lg:w-72 lg:h-72 flex items-center justify-center">
         {/* Code Screen Background */}
         <div className="absolute right-0 bottom-4 w-28 lg:w-48 h-32 lg:h-56 bg-gray-900/5 rounded-2xl border border-gray-200/50 p-2 lg:p-4 font-mono text-[10px] text-gray-300 overflow-hidden backdrop-blur-sm">
             <div className="w-full h-1 lg:h-2 bg-red-200/50 rounded-full mb-2"></div>
             <div className="w-3/4 h-1 lg:h-2 bg-gray-200 rounded-full mb-2"></div>
             <div className="w-5/6 h-1 lg:h-2 bg-gray-200 rounded-full mb-2"></div>
             {/* The Bug */}
             <div className="absolute top-1/2 right-1/4 anim-bug text-3xl lg:text-5xl">
                <span className="material-symbols-outlined drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">bug_report</span>
             </div>
             <svg className="absolute inset-0 w-full h-full opacity-20"><line x1="10" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="2" className="anim-code"/></svg>
         </div>
         
         {/* Robot */}
         <div className="absolute left-0 lg:-left-10 top-6 lg:top-10 w-16 h-16 lg:w-28 lg:h-28 bg-white/80 backdrop-blur rounded-full border-2 lg:border-4 border-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center anim-robot z-10">
            <span className="material-symbols-outlined text-3xl lg:text-5xl text-cyan-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">smart_toy</span>
            {/* Laser Origin */}
            <div className="absolute right-1 lg:right-2 top-1/2 w-2 h-2 lg:w-3 lg:h-3 bg-cyan-400 rounded-full translate-x-1/2 -translate-y-1/2"></div>
         </div>
         
         {/* Laser Beam (connecting Robot to Bug) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             <line x1="30%" y1="35%" x2="70%" y2="55%" className="anim-laser" strokeLinecap="round" />
         </svg>
      </div>
    </div>
  );
}
