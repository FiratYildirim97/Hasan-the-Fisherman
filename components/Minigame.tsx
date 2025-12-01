
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../GameContext';
import { RODS } from '../constants';
import { ArrowDown, Target } from 'lucide-react';

export const Minigame: React.FC = () => {
  const { gameState, activeFish, stats, reelIn, playSound } = useGame();
  
  // Visual State
  const [tension, setTension] = useState(0);
  const [distance, setDistance] = useState(50);
  const [isReeling, setIsReeling] = useState(false);
  const [fishState, setFishState] = useState<'calm' | 'angry'>('calm');
  
  // QTE State
  const [qte, setQte] = useState<{ active: boolean; x: number; y: number; id: number } | null>(null);

  // Logic Refs
  const requestRef = useRef<number>(0);
  const isReelingRef = useRef(false);
  const fishStateRef = useRef<'calm' | 'angry'>('calm');
  
  // QTE Logic Ref
  const qteRef = useRef<{ active: boolean; timer: number; maxTime: number }>({ active: false, timer: 0, maxTime: 0 });
  
  const params = useRef({
    tension: 0,
    distance: 50,
    maxDistance: 100,
    reelSpeed: 0.2,
    tensionRate: 0.5,
    decayRate: 1.0,
    fishStrength: 1.0
  });

  const endGame = useCallback((success: boolean, snapped: boolean) => {
    cancelAnimationFrame(requestRef.current);
    setQte(null); // Clear QTE UI if game ends
    reelIn(success, snapped); 
  }, [reelIn]);

  // Handlers
  const handleDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isReelingRef.current) {
        isReelingRef.current = true;
        setIsReeling(true);
        playSound('cast');
    }
  };

  const handleUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isReelingRef.current) {
        isReelingRef.current = false;
        setIsReeling(false);
    }
  };

  const handleQteClick = (e: React.SyntheticEvent) => {
    e.stopPropagation(); // Prevent affecting reel button if overlapped (though layout separates them)
    if (qteRef.current.active) {
        // Apply Bonus
        params.current.distance = Math.max(0, params.current.distance - 15); // Big Pull
        params.current.tension = Math.max(0, params.current.tension - 20); // Relief
        
        // Reset QTE
        qteRef.current.active = false;
        setQte(null);
        playSound('success');
    }
  };

  // Initialization
  useEffect(() => {
    if (gameState === 'MINIGAME' && activeFish) {
      const rod = RODS[stats.rodId];
      const rarity = activeFish.rarity;

      const startDist = 30 + (rarity * 10);
      const strength = 0.5 + (rarity * 0.2);
      const rodPower = rod.power;

      // Improved Tension Calculation to ensure bars fill visibly even with good rods
      // Square root dampening prevents high level rods from making the game too static
      const tensionRate = (0.5 * strength) / Math.sqrt(rodPower);

      params.current = {
        tension: 0,
        distance: startDist,
        maxDistance: startDist + 20,
        reelSpeed: 0.15 * rodPower,
        tensionRate: Math.max(0.1, tensionRate), // Minimum tension rate
        decayRate: 1.5,
        fishStrength: strength
      };

      isReelingRef.current = false;
      fishStateRef.current = 'calm';
      qteRef.current = { active: false, timer: 0, maxTime: 0 };
      
      setDistance(startDist);
      setTension(0);
      setIsReeling(false);
      setFishState('calm');
      setQte(null);
    }
  }, [gameState, activeFish, stats.rodId]); 

  // Physics Loop
  useEffect(() => {
    if (gameState !== 'MINIGAME') {
        cancelAnimationFrame(requestRef.current);
        return;
    }

    const loop = () => {
        const p = params.current;
        
        // 1. Fish Behavior
        if (Math.random() < 0.01) {
           const newState = fishStateRef.current === 'calm' ? 'angry' : 'calm';
           fishStateRef.current = newState;
           setFishState(newState);
        }

        const isAngry = fishStateRef.current === 'angry';
        const angerMult = isAngry ? 2.5 : 1.0; // Increased multiplier for better anger feedback

        // 2. Mechanics
        if (isReelingRef.current) {
            p.distance -= p.reelSpeed;
            p.tension += p.tensionRate * angerMult;
        } else {
            p.tension -= p.decayRate;
            p.distance += 0.05 * angerMult;
        }

        // 3. QTE Logic
        // Spawn chance: Only if calm, middle distance, and no active QTE
        if (!qteRef.current.active && !isAngry && p.distance > 15 && p.distance < p.maxDistance - 10 && Math.random() < 0.008) {
            const maxX = 80; // % percentage limits for positioning
            const maxY = 40; 
            const x = 10 + Math.random() * maxX;
            const y = 10 + Math.random() * maxY;
            
            qteRef.current = { active: true, timer: 90, maxTime: 90 }; // 1.5 seconds @ 60fps
            setQte({ active: true, x, y, id: Date.now() });
            playSound('click'); // distinct sound cue could be better
        }

        if (qteRef.current.active) {
            qteRef.current.timer--;
            if (qteRef.current.timer <= 0) {
                // Timeout
                qteRef.current.active = false;
                setQte(null);
            }
        }

        // 4. Limits
        if (p.tension < 0) p.tension = 0;
        
        if (p.tension >= 100) {
            endGame(false, true); 
            return;
        }
        if (p.distance <= 0) {
            endGame(true, false);
            return;
        }
        if (p.distance >= p.maxDistance) {
            endGame(false, false);
            return;
        }

        setTension(p.tension);
        setDistance(p.distance);

        requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, endGame, playSound]);

  if (gameState !== 'MINIGAME') return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm select-none touch-none overflow-hidden">
        
        {/* QTE LAYER */}
        {qte && (
            <button
                className="absolute z-[60] w-20 h-20 flex items-center justify-center animate-[pop_0.2s_ease-out]"
                style={{ left: `${qte.x}%`, top: `${qte.y}%` }}
                onMouseDown={handleQteClick}
                onTouchStart={handleQteClick}
            >
                {/* Timer Ring */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle 
                        cx="50%" cy="50%" r="36" fill="none" stroke="#fbbf24" strokeWidth="6" 
                        strokeDasharray="226" 
                        strokeDashoffset={226 * (1 - (qteRef.current.timer / qteRef.current.maxTime))}
                        className="transition-all duration-75 ease-linear"
                    />
                </svg>
                {/* Inner Target */}
                <div className="w-12 h-12 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b] flex items-center justify-center border-4 border-white active:scale-90 transition-transform">
                    <Target size={24} className="text-white animate-spin-slow" />
                </div>
                <div className="absolute -bottom-8 text-amber-400 font-black text-sm tracking-widest drop-shadow-md animate-bounce">
                    VUR!
                </div>
            </button>
        )}

        {/* INFO HEADER */}
        <div className="absolute top-20 text-center">
            <div className="text-4xl animate-[bounce_2s_infinite]">{activeFish?.emoji}</div>
            <div className={`font-bold text-xl uppercase tracking-widest transition-colors duration-300 ${fishState === 'angry' ? 'text-red-500 scale-110' : 'text-blue-300'}`}>
                {fishState === 'angry' ? '!! ÖFKELİ !!' : 'ÇEKİLİYOR'}
            </div>
            <div className="text-sm text-slate-400 font-mono mt-1">{distance.toFixed(1)}m</div>
        </div>

        {/* MAIN GAME AREA */}
        <div className="flex flex-row items-end gap-8 h-64 mb-10 relative">
            
            {/* TENSION BAR */}
            <div className={`w-12 h-full bg-slate-800 rounded-full border-2 relative overflow-hidden transition-colors duration-200 ${tension > 80 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-slate-600'}`}>
                <div 
                    className={`absolute bottom-0 w-full transition-all duration-75 ease-linear ${tension > 80 ? 'bg-red-600 animate-pulse' : tension > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ height: `${tension}%` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-white font-black text-sm drop-shadow-md">{Math.round(tension)}%</span>
                    <span className="text-[10px] font-bold text-white/70 -rotate-90 tracking-widest mt-2">GERİLİM</span>
                </div>
            </div>

            {/* DISTANCE VISUAL */}
            <div className="h-full w-2 bg-slate-700/50 rounded-full relative">
                {/* Player/Rod marker at bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_blue] z-10" />
                
                {/* Line */}
                <div 
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0.5 bg-blue-400/50"
                    style={{ height: `${Math.min(100, (distance / params.current.maxDistance) * 100)}%` }}
                />

                {/* Fish marker moving up */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-75 z-10"
                    style={{ bottom: `${Math.min(100, (distance / params.current.maxDistance) * 100)}%` }}
                >
                    🐟
                </div>
            </div>

        </div>

        {/* CONTROL BUTTON */}
        <button
            className={`w-32 h-32 rounded-full border-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all duration-100 active:scale-95
                ${isReeling 
                    ? 'bg-red-600 border-red-400 shadow-red-900/50 scale-95' 
                    : 'bg-emerald-600 border-emerald-400 shadow-emerald-900/50 animate-[pulse_2s_infinite]'}
            `}
            onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}
            onTouchStart={handleDown} onTouchEnd={handleUp}
        >
            <ArrowDown size={40} className={`text-white mb-1 transition-transform ${isReeling ? 'translate-y-2' : ''}`} />
            <span className="text-xs font-black text-white tracking-widest">
                {isReeling ? 'ÇEKİYOR' : 'BASILI TUT'}
            </span>
        </button>

        <div className="mt-8 text-center text-slate-400 text-xs font-bold max-w-xs leading-relaxed opacity-80">
            Misinayı koparmadan (Kırmızı Bar) balığı kendine çek.<br/>
            <span className="text-yellow-500">Öfkeliyken DUR. Hedef çıkarsa VUR!</span>
        </div>

        <style>{`
            @keyframes pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
    </div>
  );
};
