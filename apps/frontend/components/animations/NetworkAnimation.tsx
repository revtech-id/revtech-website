"use client";

export default function NetworkAnimation() {
  return (
    <div className="relative w-full h-full min-h-[150px] lg:min-h-[400px] flex items-center justify-center bg-transparent">
      <style jsx>{`
        @keyframes floatNode {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        @keyframes dataTransfer {
            0% { stroke-dashoffset: 100; opacity: 0; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .anim-node-1 { animation: floatNode 5s ease-in-out infinite; }
        .anim-node-2 { animation: floatNode 6s ease-in-out infinite 1s; }
        .anim-node-3 { animation: floatNode 4s ease-in-out infinite 2s; }
        .anim-node-4 { animation: floatNode 7s ease-in-out infinite 0.5s; }
        
        .line-glow {
            stroke: rgba(168, 85, 247, 0.3);
            stroke-width: 2;
        }
        .data-glow {
            stroke: #d946ef;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-dasharray: 20 80;
            animation: dataTransfer 2s linear infinite;
        }
      `}</style>
      
      <div className="relative w-full max-w-[200px] lg:max-w-[280px] aspect-square flex items-center justify-center scale-90 lg:scale-100">
          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible z-0" viewBox="0 0 100 100">
             <line x1="20" y1="30" x2="80" y2="20" className="line-glow" />
             <line x1="20" y1="30" x2="50" y2="80" className="line-glow" />
             <line x1="80" y1="20" x2="50" y2="80" className="line-glow" />
             <line x1="80" y1="20" x2="90" y2="60" className="line-glow" />
             
             {/* Data transferring */}
             <line x1="20" y1="30" x2="80" y2="20" className="data-glow" />
             <line x1="50" y1="80" x2="20" y2="30" className="data-glow" style={{ animationDelay: '0.5s' }} />
             <line x1="80" y1="20" x2="50" y2="80" className="data-glow" style={{ animationDelay: '1s' }} />
          </svg>
          
          {/* Nodes */}
          <div className="absolute top-[20%] left-[10%] w-10 h-10 lg:w-14 lg:h-14 bg-white/80 backdrop-blur rounded-xl lg:rounded-2xl rotate-12 shadow-[0_0_20px_rgba(168,85,247,0.5)] lg:shadow-[0_0_30px_rgba(168,85,247,0.5)] anim-node-1 flex items-center justify-center text-purple-600 border border-purple-100 z-10">
            <span className="material-symbols-outlined text-[20px] lg:text-[28px]">api</span>
          </div>
          
          <div className="absolute top-[10%] right-[10%] w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full shadow-[0_0_30px_rgba(217,70,239,0.8)] lg:shadow-[0_0_40px_rgba(217,70,239,0.8)] anim-node-2 flex items-center justify-center text-white z-10 border-2 border-white/50">
            <span className="material-symbols-outlined text-[24px] lg:text-[32px]">database</span>
          </div>
          
          <div className="absolute bottom-[10%] left-[40%] w-16 h-16 lg:w-20 lg:h-20 bg-white/90 backdrop-blur rounded-full shadow-[0_0_40px_rgba(99,102,241,0.6)] lg:shadow-[0_0_50px_rgba(99,102,241,0.6)] anim-node-3 flex items-center justify-center text-indigo-600 border border-indigo-100 z-10">
            <span className="material-symbols-outlined text-[30px] lg:text-[40px]">public</span>
          </div>
          
          <div className="absolute bottom-[30%] right-[0%] w-8 h-8 lg:w-10 lg:h-10 bg-pink-500 rounded-lg -rotate-12 shadow-[0_0_15px_rgba(236,72,153,0.6)] lg:shadow-[0_0_25px_rgba(236,72,153,0.6)] anim-node-4 flex items-center justify-center text-white z-10 border border-white/30">
             <span className="material-symbols-outlined text-[16px] lg:text-[20px]">bolt</span>
          </div>
      </div>
    </div>
  );
}
