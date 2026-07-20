"use client";

export default function WebDevAnimation() {
  return (
    <div className="relative w-full h-full min-h-[150px] lg:min-h-[400px] flex items-center justify-center bg-transparent">
      <style jsx>{`
        .iso-container {
            transform-style: preserve-3d;
            transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg);
        }
        @keyframes slideUp3D {
          0% { transform: translateZ(-100px); opacity: 0; }
          100% { transform: translateZ(0); opacity: 1; }
        }
        .iso-block {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 
                -10px 10px 20px rgba(59, 130, 246, 0.2),
                inset 2px -2px 5px rgba(255, 255, 255, 0.5);
            border-radius: 12px;
        }
        .anim-b1 { animation: slideUp3D 1s ease-out 0.2s forwards; opacity: 0; }
        .anim-b2 { animation: slideUp3D 1s ease-out 0.6s forwards; opacity: 0; }
        .anim-b3 { animation: slideUp3D 1s ease-out 1.0s forwards; opacity: 0; }
        .anim-b4 { animation: slideUp3D 1s ease-out 1.4s forwards; opacity: 0; }
        
        @keyframes floatIso {
            0%, 100% { transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg) translateZ(0px); }
            50% { transform: perspective(1000px) rotateX(60deg) rotateZ(-45deg) translateZ(20px); }
        }
        .iso-float {
            animation: floatIso 6s ease-in-out infinite;
        }
      `}</style>
      
      <div className="iso-container iso-float relative w-40 h-40 lg:w-64 lg:h-64">
         {/* Base Platform */}
         <div className="absolute inset-0 bg-blue-500/10 rounded-2xl border-2 border-blue-200/50 shadow-[0_0_50px_rgba(59,130,246,0.3)]"></div>
         
         {/* Layer 1: Content Block */}
         <div className="iso-block anim-b1 absolute bottom-4 right-4 w-20 h-16 lg:w-32 lg:h-24 flex items-center justify-center text-blue-500">
             <span className="material-symbols-outlined text-2xl lg:text-4xl">view_quilt</span>
         </div>
         
         {/* Layer 2: Sidebar */}
         <div className="iso-block anim-b2 absolute bottom-4 left-4 w-8 h-28 lg:w-12 lg:h-44 flex flex-col items-center py-2 lg:py-4 gap-2 text-blue-400">
             <div className="w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-blue-200/50"></div>
             <div className="w-4 h-8 lg:w-6 lg:h-12 rounded-lg bg-blue-200/50 mt-auto"></div>
         </div>
         
         {/* Layer 3: Header */}
         <div className="iso-block anim-b3 absolute top-4 right-4 w-20 h-8 lg:w-32 lg:h-12 flex items-center px-2 lg:px-4 text-blue-500" style={{ transform: 'translateZ(30px)' }}>
             <div className="w-10 h-2 lg:w-16 lg:h-3 rounded-full bg-blue-400/50"></div>
         </div>
         
         {/* Layer 4: Floating Action Button */}
         <div className="iso-block anim-b4 absolute bottom-8 right-8 w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-blue-600 bg-white/80" style={{ transform: 'translateZ(60px)' }}>
             <span className="material-symbols-outlined text-lg lg:text-2xl">add</span>
         </div>
      </div>
    </div>
  );
}
