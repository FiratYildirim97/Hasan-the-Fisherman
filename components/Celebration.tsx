
import React from 'react';
import { useGame } from '../GameContext';
import { FishRenderer } from './Scene';

export const Celebration: React.FC = () => {
  const { celebrationFish, closeCelebration, pedia } = useGame();

  if (!celebrationFish) return null;

  const isRecord = celebrationFish.weight === pedia[celebrationFish.name]?.maxWeight;
  const isGoldCrown = celebrationFish.crown === 'gold';
  const isSpecialRed = celebrationFish.name === "Efsanevi Kırmızı Balık";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
      onClick={closeCelebration} // Allow closing by clicking background
    >
      {/* Confetti Background (CSS based simple particles) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-[pop_1s_ease-out_infinite]"
            style={{
              left: `${50 + (Math.random() - 0.5) * 80}%`,
              top: `${50 + (Math.random() - 0.5) * 80}%`,
              animationDelay: `${Math.random()}s`,
              backgroundColor: isSpecialRed
                ? ['#ff0000', '#990000', '#ff5555'][i % 3] 
                : isGoldCrown ? ['#facc15', '#fbbf24', '#eab308'][i % 3]
                : ['#facc15', '#3b82f6', '#ec4899', '#10b981'][i % 4]
            }}
          />
        ))}
      </div>

      <div 
        className={`relative flex flex-col items-center animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)] ${isSpecialRed ? 'animate-pulse' : ''}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content card
      >
        
        {/* Glow effect - Added pointer-events-none to fix button unclickability */}
        <div className={`absolute inset-0 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none ${isSpecialRed ? 'bg-red-500/50' : isGoldCrown ? 'bg-yellow-500/40' : 'bg-yellow-500/20'}`} />

        <div className="text-5xl mb-4 animate-bounce">
          {isSpecialRed ? '👹' : isGoldCrown ? '👑' : (isRecord ? '🏆' : (celebrationFish.rarity >= 6 ? '💎' : '🌟'))}
        </div>

        <h2 className={`text-3xl font-black text-transparent bg-clip-text tracking-widest mb-2 text-center px-4 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)] ${
          isSpecialRed 
            ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500 drop-shadow-[0_2px_20px_rgba(255,0,0,0.8)] text-4xl' 
            : isGoldCrown
            ? 'bg-gradient-to-r from-yellow-300 via-yellow-600 to-yellow-300 drop-shadow-[0_2px_15px_rgba(234,179,8,0.7)]'
            : 'bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300'
        }`}>
          {isSpecialRed ? 'OKYANUSUN HAKİMİ!' : isGoldCrown ? 'ALTIN TAÇ!' : (isRecord ? 'YENİ REKOR!' : 'HARİKA AV!')}
        </h2>
        
        <div className={`bg-slate-800/80 p-6 rounded-3xl border-2 shadow-2xl flex flex-col items-center gap-2 min-w-[300px] ${isGoldCrown ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-slate-700'}`}>
          {/* Main Visual */}
          <div className="w-48 h-48 mb-2 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-[float_4s_ease-in-out_infinite] relative">
             <FishRenderer visual={celebrationFish.visual} />
             {isGoldCrown && (
                <div className="absolute -top-6 -right-6 text-4xl rotate-12 animate-pulse">👑</div>
             )}
          </div>
          
          <div className="text-2xl font-black text-white flex items-center gap-2">
            {celebrationFish.name}
          </div>
          
          <div className="flex flex-col gap-1 items-center mt-2 font-mono">
             <div className="text-base font-bold text-slate-100 bg-slate-900/60 px-4 py-1 rounded-full border border-slate-700">⚖️ {celebrationFish.weight.toFixed(2)} kg</div>
             <div className="text-xl font-black text-yellow-400 drop-shadow-sm">💰 {celebrationFish.value.toLocaleString()} TL</div>
             {isGoldCrown && <div className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase mt-1 animate-pulse">Maximum Boyut Sınıfı</div>}
          </div>
        </div>

        <button 
          onClick={closeCelebration}
          className="mt-8 px-10 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-black text-lg rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform relative z-10"
        >
          HARİKA!
        </button>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.5) translate(var(--tw-translate-x), var(--tw-translate-y)); opacity: 0; }
        }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
      `}</style>
    </div>
  );
};
