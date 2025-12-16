
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '../GameContext';
import { RODS } from '../constants';
import { Anchor, AlertOctagon, Activity, HelpCircle } from 'lucide-react';
import { FishRenderer } from './Scene';
import { WeatherType } from '../types';

export const Minigame: React.FC = () => {
  const { gameState, activeFish, stats, reelIn, playSound, weather } = useGame();
  
  // -- REFS (Performance: We use refs instead of state for the animation loop) --
  const tensionRef = useRef(0);
  const progressRef = useRef(20);
  const staminaRef = useRef(100);
  const isReelingRef = useRef(false);
  const requestRef = useRef<number>(0);

  // -- DOM REFS (Direct manipulation avoids React re-renders) --
  const tensionCircleRef = useRef<SVGCircleElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const staminaBarRef = useRef<HTMLDivElement>(null);
  const staminaTextRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // -- LOGIC CONSTANTS --
  const params = useRef({
    tensionGain: 0.5,
    tensionLoss: 1.0,
    reelSpeedBase: 0.1,
    escapeSpeedBase: 0.05,
    staminaDrain: 0.05,
    isBoss: false
  });

  // Helper to update visual color of tension ring
  const updateTensionColor = (t: number) => {
      if (!tensionCircleRef.current) return;
      let color = '#10b981'; // Green
      if (t > 50) color = '#f59e0b'; // Orange
      if (t > 80) color = '#ef4444'; // Red
      tensionCircleRef.current.style.stroke = color;
      tensionCircleRef.current.style.filter = t > 80 ? `drop-shadow(0 0 10px ${color})` : 'none';
  };

  const handleDown = (e: React.SyntheticEvent) => { 
      e.preventDefault(); 
      if (!isReelingRef.current) { 
          isReelingRef.current = true; 
          playSound('cast'); 
          if (btnRef.current) {
              btnRef.current.style.transform = 'scale(0.95)';
              btnRef.current.style.backgroundColor = '#334155'; // slate-700
              btnRef.current.innerText = 'ÇEKİYOR...';
          }
      } 
  };
  
  const handleUp = (e: React.SyntheticEvent) => { 
      e.preventDefault(); 
      if (isReelingRef.current) { 
          isReelingRef.current = false; 
          if (btnRef.current) {
              btnRef.current.style.transform = 'scale(1)';
              btnRef.current.style.backgroundColor = ''; // Reset to class default
              btnRef.current.innerText = 'SAR!';
          }
      } 
  };

  const endGame = useCallback((success: boolean, snapped: boolean) => {
    cancelAnimationFrame(requestRef.current);
    reelIn(success, snapped, success && staminaRef.current < 10); 
  }, [reelIn]);

  // Initialization
  useEffect(() => {
    if (gameState === 'MINIGAME' && activeFish) {
      const rod = RODS[stats.rodId];
      const rarity = activeFish.rarity;
      const isBoss = activeFish.isBoss || false;

      let difficultyMod = 1.0;
      if (weather === WeatherType.RAIN) difficultyMod = 1.1;
      if (weather === WeatherType.STORM) difficultyMod = 1.25;

      params.current = {
        tensionGain: (0.6 * difficultyMod) / Math.sqrt(rod.power),
        tensionLoss: 1.2, 
        reelSpeedBase: 0.15 * Math.sqrt(rod.power), 
        escapeSpeedBase: (0.08 * rarity) * difficultyMod, 
        staminaDrain: (0.1 * rod.power) / rarity, 
        isBoss: isBoss
      };

      // Reset Values
      tensionRef.current = 0;
      progressRef.current = 20;
      staminaRef.current = 100;
      isReelingRef.current = false;
    }
  }, [gameState, activeFish, stats.rodId, weather]);

  // Main Physics Loop (60 FPS)
  useEffect(() => {
    if (gameState !== 'MINIGAME') { cancelAnimationFrame(requestRef.current); return; }

    let lastStatus = '';

    const loop = () => {
        const pm = params.current;
        let t = tensionRef.current;
        let p = progressRef.current;
        let s = staminaRef.current;

        // 1. Physics Calculation
        if (isReelingRef.current) {
            t += pm.tensionGain;
            s = Math.max(0, s - (pm.staminaDrain * 0.1));
        } else {
            t -= pm.tensionLoss;
        }

        // Constraints
        if (t < 0) t = 0;
        if (t >= 100) { endGame(false, true); return; }

        const riskRewardFactor = 0.2 + (t / 100) * 3.0; // High risk = 3.2x speed

        if (isReelingRef.current) {
            p += pm.reelSpeedBase * riskRewardFactor;
            if (t > 70) s = Math.max(0, s - pm.staminaDrain); // Critical damage to fish
        } else {
            const fatigueFactor = 0.2 + (s / 100) * 0.8; 
            p -= pm.escapeSpeedBase * fatigueFactor;
        }

        if (p < 0) p = 0;
        if (p >= 100) { endGame(true, false); return; }

        // Update Refs
        tensionRef.current = t;
        progressRef.current = p;
        staminaRef.current = s;

        // 2. Direct DOM Updates (No React Render)
        
        // Tension Ring (Inner) - Radius 40 -> Circumference ~251
        if (tensionCircleRef.current) {
            const circ = 2 * Math.PI * 40;
            const offset = circ - (t / 100) * circ;
            tensionCircleRef.current.style.strokeDashoffset = `${offset}px`;
            updateTensionColor(t);
        }

        // Progress Ring (Outer) - Radius 48 -> Circumference ~301
        if (progressCircleRef.current) {
            const circ = 2 * Math.PI * 48;
            const offset = circ - (p / 100) * circ;
            progressCircleRef.current.style.strokeDashoffset = `${offset}px`;
        }

        // Stamina Bar
        if (staminaBarRef.current) {
            staminaBarRef.current.style.width = `${s}%`;
            staminaBarRef.current.style.backgroundColor = s < 30 ? '#ef4444' : '#facc15';
        }
        if (staminaTextRef.current) {
            staminaTextRef.current.innerText = `${Math.ceil(s)}%`;
        }

        // Shake Effect & Status Text (Throttled text updates)
        let currentStatus = 'Güvenli Çekim...';
        let statusColor = 'text-slate-500';
        
        if (t > 80) {
            currentStatus = 'KOPUYOR! BIRAK!';
            statusColor = 'text-red-500';
            if (containerRef.current) containerRef.current.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
        } else if (t > 50) {
            currentStatus = 'HIZLI ÇEKİM!';
            statusColor = 'text-green-400';
            if (containerRef.current) containerRef.current.style.transform = 'none';
        } else {
            if (containerRef.current) containerRef.current.style.transform = 'none';
        }

        // Only touch DOM text if changed
        if (currentStatus !== lastStatus && statusTextRef.current) {
            statusTextRef.current.className = `font-black text-xl animate-pulse ${statusColor}`;
            statusTextRef.current.innerText = currentStatus;
            lastStatus = currentStatus;
        }

        requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, endGame]);

  if (gameState !== 'MINIGAME') return null;

  const isBoss = params.current.isBoss;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center select-none touch-none bg-black/80 backdrop-blur-sm">
        
        {/* Boss Indicator */}
        {isBoss && (
            <div className="absolute top-16 animate-pulse flex items-center gap-2 z-10">
                <AlertOctagon className="text-red-500" />
                <span className="text-red-500 font-black text-2xl tracking-widest drop-shadow-[0_0_10px_red]">BOSS SAVAŞI</span>
                <AlertOctagon className="text-red-500" />
            </div>
        )}

        {/* Fish Stamina Bar (Top) */}
        <div className="absolute top-28 w-64 z-10">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                <span>Balık Gücü</span>
                <span ref={staminaTextRef} className="text-white">100%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div ref={staminaBarRef} className="h-full bg-yellow-400 transition-none" style={{ width: '100%' }} />
            </div>
        </div>

        {/* MAIN CIRCULAR UI */}
        <div ref={containerRef} className="relative w-72 h-72 flex items-center justify-center my-8 transition-transform duration-75 will-change-transform">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border-8 border-slate-800 bg-slate-900/80 shadow-2xl"></div>

            <svg className="absolute inset-0 w-full h-full rotate-[-90deg] overflow-visible">
                {/* 1. Tension Arc (Inner - Risk) */}
                <circle 
                    ref={tensionCircleRef}
                    cx="50%" cy="50%" r="40%" fill="none" 
                    stroke="#10b981" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}px`} 
                    strokeDashoffset={`${2 * Math.PI * 40}px`}
                    className="transition-none"
                />
                
                {/* 2. Progress Arc (Outer - Success) */}
                <circle 
                    ref={progressCircleRef}
                    cx="50%" cy="50%" r="48%" fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}px`}
                    strokeDashoffset={`${2 * Math.PI * 48 * 0.8}px`} // Start at 20%
                    className="transition-none"
                />
            </svg>

            {/* Center Icon */}
            <div className="relative z-10 w-32 h-32 flex items-center justify-center rounded-full">
                 <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent rounded-full animate-pulse"></div>
                 <div className="w-24 h-24 drop-shadow-2xl">
                    <FishRenderer visual={activeFish?.visual} />
                 </div>
            </div>
        </div>

        {/* Status Text (Optimized) */}
        <div className="h-10 flex items-center justify-center mb-4">
            <div ref={statusTextRef} className="text-slate-500 text-sm font-medium">Hazır...</div>
        </div>

        {/* Control Button */}
        <button 
            ref={btnRef}
            className="w-full max-w-xs py-6 rounded-2xl font-black text-2xl tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-colors touch-manipulation border-b-8 select-none bg-gradient-to-b from-blue-500 to-blue-700 border-blue-900 text-white"
            onMouseDown={handleDown} 
            onMouseUp={handleUp} 
            onMouseLeave={handleUp} 
            onTouchStart={handleDown} 
            onTouchEnd={handleUp}
        >
            SAR!
        </button>
        
        {/* Tutorial Text */}
        <div className="mt-6 flex items-start gap-2 max-w-xs text-left bg-slate-900/50 p-3 rounded-xl border border-white/5">
            <HelpCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-300 leading-relaxed">
                <span className="text-white font-bold block mb-1">NASIL OYNANIR?</span>
                Tuşa basılı tutarak ibreyi yükselt. <span className="text-red-400 font-bold">Kırmızı bölgeye</span> yaklaştıkça balık <span className="text-green-400 font-bold">çok daha hızlı</span> gelir. Misinayı koparmadan (%100) limiti zorla!
            </div>
        </div>
    </div>
  );
};
