
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../GameContext';
import { RODS } from '../constants';
import { Anchor, Zap, AlertTriangle, Target, Timer, Star, Sparkles, Trophy } from 'lucide-react';
import { GameState } from '../types';

export const Minigame: React.FC = () => {
    const { gameState, activeFish, stats, reelIn, playSound } = useGame();

    // -- State --
    const [progress, setProgress] = useState(0); 
    const [tension, setTension] = useState(0);   
    const [ringScale, setRingScale] = useState(100); 
    const [hitType, setHitType] = useState<'perfect' | 'good' | 'miss' | null>(null); 
    const [combo, setCombo] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    
    // -- Physics Refs --
    const stateRef = useRef({
        progress: 0,
        tension: 0,
        ringScale: 100, 
        ringSpeed: 2,
        lastTime: 0,
        combo: 0,
        isFinishing: false
    });

    const requestRef = useRef<number>(0);

    // -- Config --
    const config = useRef({
        perfectMin: 22, 
        perfectMax: 28,
        goodMin: 15,
        goodMax: 35,
        progressGain: 12,
        tensionGain: 10,
    });

    const triggerHitEffect = (type: 'perfect' | 'good' | 'miss') => {
        setHitType(type);
        setTimeout(() => setHitType(null), 600);
    };

    const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (gameState !== GameState.MINIGAME || stateRef.current.isFinishing) return;
        if (e.cancelable) e.preventDefault();

        const s = stateRef.current;
        const c = config.current;

        const val = s.ringScale;
        const isPerfect = val >= c.perfectMin && val <= c.perfectMax;
        const isGood = val >= c.goodMin && val <= c.goodMax;

        if (isPerfect) {
            playSound('success');
            triggerHitEffect('perfect');
            s.progress = Math.min(100, s.progress + c.progressGain * 1.5 + (s.combo * 2));
            s.tension = Math.max(0, s.tension - 10);
            s.combo += 1;
            s.ringScale = 100;
        } else if (isGood) {
            playSound('success');
            triggerHitEffect('good');
            s.progress = Math.min(100, s.progress + c.progressGain + (s.combo * 1));
            s.tension = Math.max(0, s.tension - 5);
            s.combo += 1;
            s.ringScale = 100;
        } else {
            playSound('fail');
            triggerHitEffect('miss');
            s.tension = Math.min(100, s.tension + c.tensionGain);
            s.combo = 0;
            s.ringScale = 100;
        }

        setProgress(s.progress);
        setTension(s.tension);
        setCombo(s.combo);

        if (s.progress >= 100) {
            s.isFinishing = true;
            setIsFinishing(true);
            playSound('lvl'); // Level up/Win sound
            setTimeout(() => {
                reelIn(true, false, true);
            }, 1200); // Wait for the "SUCCESS" animation
        }
    }, [gameState, playSound, reelIn]);

    useEffect(() => {
        if (gameState === GameState.MINIGAME && activeFish) {
            const rod = RODS[stats.rodId] || RODS[0];
            const rarity = activeFish.rarity;
            const isBoss = activeFish.isBoss;

            config.current = {
                perfectMin: 22,
                perfectMax: 28,
                goodMin: 18 - (rod.power),
                goodMax: 32 + (rod.power),
                progressGain: (12 + (rod.power * 2)) * (isBoss ? 0.6 : 1.0), // Bosses are harder to pull
                tensionGain: (8 + (rarity * 2)) * (isBoss ? 1.5 : 1.0),      // Bosses pull harder
            };

            stateRef.current = {
                progress: 0,
                tension: 0,
                ringScale: 100,
                ringSpeed: (1.2 + (rarity * 0.5)) * (isBoss ? 1.4 : 1.0),
                lastTime: performance.now(),
                combo: 0,
                isFinishing: false
            };
            
            setProgress(0);
            setTension(0);
            setRingScale(100);
            setCombo(0);
            setIsFinishing(false);
        }
    }, [gameState, activeFish, stats.rodId]);

    // Game Loop
    useEffect(() => {
        if (gameState !== GameState.MINIGAME || stateRef.current.isFinishing || !activeFish) return;

        const loop = (time: number) => {
            const dt = Math.min(32, time - stateRef.current.lastTime) / 16.67; 
            stateRef.current.lastTime = time;

            const s = stateRef.current;

            s.ringScale -= s.ringSpeed * dt;

            if (s.ringScale <= 10) {
                s.ringScale = 100;
                s.tension = Math.min(100, s.tension + 8);
                s.combo = 0;
                triggerHitEffect('miss');
                playSound('fail');
            }

            s.tension = Math.max(0, s.tension - 0.04 * dt);
            s.progress = Math.max(0, s.progress - 0.02 * dt);

            setRingScale(s.ringScale);
            setProgress(s.progress);
            setTension(s.tension);
            setCombo(s.combo);

            if (s.tension >= 100) {
                reelIn(false, true, false);
                return;
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, activeFish, reelIn, playSound]);

    if (gameState !== GameState.MINIGAME || !activeFish) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-fade-in touch-none select-none overflow-hidden">
            
            {/* SUCCESS OVERLAY ANIMATION */}
            {isFinishing && (
                <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-blue-600/20 backdrop-blur-sm animate-success-flash">
                    <div className="flex flex-col items-center animate-success-zoom">
                        <Trophy size={120} className="text-amber-400 mb-6 drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]" />
                        <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-2xl">YAKALANDI!</h1>
                        <div className="flex gap-2 mt-4">
                            <Sparkles className="text-white animate-pulse" />
                            <span className="text-blue-200 font-bold tracking-widest text-sm">HARİKA BİR AV!</span>
                            <Sparkles className="text-white animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {/* MINIMALIST HUD */}
            <div className="absolute top-12 w-full max-w-xs flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase">AVDAKİ BALIK</span>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">{activeFish.name}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">MESAFE</span>
                        <div className="text-4xl font-black font-mono tracking-tighter text-white">%{Math.floor(progress)}</div>
                    </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full relative">
                     <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 transition-all duration-300 relative"
                        style={{ width: `${progress}%` }}
                     >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
                     </div>
                </div>
            </div>

            {/* THE RHYTHM AREA */}
            <div className={`relative w-80 h-80 flex items-center justify-center transition-all duration-300 ${isFinishing ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                
                {/* Hit Feedback Text */}
                {hitType && (
                    <div className={`absolute -top-12 z-30 font-black italic tracking-tighter text-3xl animate-hit-up pointer-events-none ${
                        hitType === 'perfect' ? 'text-amber-400' : 
                        hitType === 'good' ? 'text-blue-400' : 'text-red-500'
                    }`}>
                        {hitType === 'perfect' ? 'MÜKEMMEL!' : hitType === 'good' ? 'GÜZEL!' : 'KAÇIRDIK!'}
                    </div>
                )}

                {/* THE STATIC TARGET RINGS */}
                <div 
                    className={`absolute rounded-full border-4 transition-all duration-150 z-10 ${
                        hitType === 'perfect' ? 'border-amber-400 scale-[1.1] shadow-[0_0_60px_#fbbf24]' :
                        hitType === 'good' ? 'border-green-400 scale-[1.05] shadow-[0_0_40px_#4ade80]' : 
                        'border-blue-500/50 shadow-[0_0_20px_#3b82f633]'
                    }`}
                    style={{ width: '28%', height: '28%' }}
                />
                
                {/* OUTER ZONE (GOOD) */}
                <div 
                    className="absolute rounded-full border border-white/10"
                    style={{ width: '35%', height: '35%' }}
                />

                {/* THE SHRINKING RING */}
                <div 
                    className="absolute rounded-full border-2 border-white/60 shadow-inner pointer-events-none"
                    style={{ 
                        width: `${ringScale}%`, 
                        height: `${ringScale}%`,
                        opacity: ringScale / 100,
                        filter: ringScale < 35 && ringScale > 18 ? 'brightness(1.5) drop-shadow(0 0 10px #fff)' : 'none'
                    }}
                />

                {/* THE CENTER FISH ICON */}
                <div className={`relative z-20 flex flex-col items-center ${tension > 70 ? 'animate-shake' : ''}`}>
                    <div className={`text-9xl transition-transform duration-100 drop-shadow-[0_0_30px_#fff3] ${hitType ? 'scale-125' : 'scale-100'} ${isFinishing ? 'animate-win-spin' : ''}`}>
                        {activeFish.emoji}
                        {activeFish.isBoss && <div className="absolute -top-4 -right-4 text-4xl animate-pulse">👑</div>}
                    </div>
                    {combo > 1 && (
                        <div className="absolute -bottom-10 bg-blue-600 px-4 py-1.5 rounded-full text-xs font-black text-white italic tracking-tighter animate-bounce h-fit shadow-xl border border-white/20">
                            KOMBO x{combo}
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Footer */}
            <div className={`mt-12 w-full max-w-sm space-y-10 flex flex-col items-center transition-all duration-300 ${isFinishing ? 'translate-y-40 opacity-0' : 'translate-y-0 opacity-100'}`}>
                
                <div className="flex flex-col items-center gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">VAKTİ GELİNCE DOKUN</span>
                        <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-slate-700" />
                     </div>

                     <button
                        onMouseDown={handleTap}
                        onTouchStart={handleTap}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_20px_50px_rgba(59,130,246,0.4)] border-4 border-slate-900 active:scale-90 active:from-blue-400 active:to-blue-600 cursor-pointer relative overflow-hidden`}
                     >
                        <Target size={48} className="text-white relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                     </button>
                </div>

                {/* Tension Meter (Very thin) */}
                <div className="w-48 space-y-2">
                     <div className="flex justify-between items-center text-[8px] font-black text-slate-500 tracking-[0.2em]">
                        <span>MİSİNA GERGİNLİĞİ</span>
                        <span className={tension > 80 ? 'text-red-500 animate-pulse' : 'text-slate-400'}>%{Math.floor(tension)}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${tension > 80 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-slate-700'}`}
                            style={{ width: `${tension}%` }}
                        />
                     </div>
                </div>
            </div>

            <style>{`
                @keyframes hit-up {
                    0% { transform: translateY(20px) scale(0.5); opacity: 0; }
                    50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
                    100% { transform: translateY(-50px) scale(1); opacity: 0; }
                }
                .animate-hit-up { animation: hit-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes success-flash {
                    0% { background-color: rgba(59, 130, 246, 0); }
                    10% { background-color: rgba(255, 255, 255, 0.8); }
                    100% { background-color: rgba(59, 130, 246, 0.2); }
                }
                .animate-success-flash { animation: success-flash 1.2s ease-out forwards; }
                
                @keyframes success-zoom {
                    0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
                    20% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); }
                }
                .animate-success-zoom { animation: success-zoom 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes shimmer-fast {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer-fast { animation: shimmer-fast 1s infinite; }
                
                @keyframes shake {
                    0%, 100% { transform: translate(0,0) rotate(0); }
                    25% { transform: translate(-2px, 2px) rotate(-1deg); }
                    75% { transform: translate(2px, -2px) rotate(1deg); }
                }
                .animate-shake { animation: shake 0.1s infinite; }

                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};
