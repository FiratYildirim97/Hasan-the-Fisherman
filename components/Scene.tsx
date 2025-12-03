import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../GameContext';
import { RODS, LOCATIONS, BOBBERS } from '../constants';
import { GameState, WeatherType, FishVisual } from '../types';

export const Scene: React.FC = () => {
  const { stats, gameState, weather, toast, floatingTexts, catchVisual, supplyCrate, collectCrate, playSound, timeOfDay } = useGame();
  const location = LOCATIONS[stats.locId];
  const rod = RODS[stats.rodId];

  const [ripples, setRipples] = useState<{id:number, x:number, y:number}[]>([]);

  // Dynamic Theme Calculation based on Time of Day
  const theme = useMemo(() => {
    const isAbyss = location.id >= 23 && location.id <= 26;
    
    if (isAbyss) {
        return { 
            sky: ['#000000', '#020617'], 
            water: ['#000000', '#0f172a'], 
            sun: 'transparent', 
            opacity: 0.4 
        };
    }

    switch (timeOfDay) {
        case 'night':
            return { 
                sky: ['#0f172a', '#312e81'], 
                water: ['#1e1b4b', '#172554'], 
                sun: '#f8fafc', // Moon color
                opacity: 0.5 // Darker filter
            };
        case 'sunset':
            return { 
                sky: ['#4c1d95', '#f97316'], 
                water: ['#7c2d12', '#9a3412'], 
                sun: '#fdba74', 
                opacity: 0.8
            };
        default: // Day
            if (location.biome === 'ice') return { sky: ['#e0f2fe', '#bae6fd'], water: ['#0ea5e9', '#0284c7'], sun: '#fdfbf7', opacity: 1 };
            if (location.biome === 'tropical') return { sky: ['#22d3ee', '#67e8f9'], water: ['#0891b2', '#06b6d4'], sun: '#fef08a', opacity: 1 };
            return { sky: ['#38bdf8', '#0ea5e9'], water: ['#0284c7', '#0369a1'], sun: '#fde047', opacity: 1 };
    }
  }, [timeOfDay, location]);

  const activeBobber = BOBBERS.find(b => b.id === stats.bobberId) || BOBBERS[0];

  const handleSceneClick = (e: React.MouseEvent) => {
      if (gameState === GameState.IDLE) {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          if (y > 60) { // Clicked on water
              const id = Date.now();
              setRipples(prev => [...prev, { id, x, y }]);
              playSound('splash');
              setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
          }
      }
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-slate-900 select-none transition-colors duration-[2000ms]" onClick={handleSceneClick}>
      
      <LocationScene 
        locId={stats.locId} 
        theme={theme}
        weather={weather}
        timeOfDay={timeOfDay}
        biome={location.biome}
      />
      
      {/* Ripples Effect */}
      {ripples.map(r => (
          <div key={r.id} className="absolute w-8 h-4 border-2 border-white/40 rounded-[50%] animate-[splash_1s_ease-out] pointer-events-none" style={{ left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}

      {/* Supply Crate */}
      {supplyCrate && supplyCrate.active && (
          <div 
            className="absolute w-12 h-12 bg-[#451a03] border-2 border-[#d97706] rounded-lg flex items-center justify-center text-2xl animate-[float_3s_ease-in-out_infinite] cursor-pointer hover:scale-110 transition-transform shadow-xl z-20 group"
            style={{ left: `${supplyCrate.x}%`, top: `${supplyCrate.y}%` }}
            onClick={(e) => { e.stopPropagation(); collectCrate(); }}
          >
             📦
             <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse group-hover:bg-yellow-400/40" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
      )}

      {/* Catch Animation Overlay */}
      {catchVisual && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {catchVisual.shiny && <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay z-10" />}
          {catchVisual.rarity >= 4 && (
             <div className="absolute bottom-[20%] w-[500px] h-[800px] bg-gradient-to-t from-yellow-400/30 to-transparent clip-triangle origin-bottom animate-[godray_2s_ease-out]" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          )}
          <div className="absolute bottom-[20%] animate-[fishRise_1s_cubic-bezier(0.18,0.89,0.32,1.28)_forwards] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]" style={{ filter: catchVisual.shiny ? 'hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 20px cyan)' : '' }}>
            <div className="w-48 h-48"><FishRenderer visual={catchVisual.visual} /></div>
          </div>
        </div>
      )}

      {/* Floating Text */}
      {floatingTexts.map(ft => (
        <div key={ft.id} className={`absolute z-[60] pointer-events-none animate-[floatUp_1.5s_ease-out_forwards] ${ft.color} drop-shadow-[0_2px_0_rgba(0,0,0,1)] text-2xl font-black tracking-wide`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
          {ft.text}
        </div>
      ))}

      {/* Toast Notification */}
      <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {toast && (
          <div className="px-6 py-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl text-center min-w-[200px]">
            <div className={`font-bold text-lg ${toast.color} drop-shadow-sm`}>{toast.msg}</div>
            {toast.sub && <div className="text-xs text-slate-400 font-medium">{toast.sub}</div>}
          </div>
        )}
      </div>

      {/* Location Sign */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-0 flex items-center gap-3 px-6 py-2 bg-slate-950/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
         <span className="text-2xl filter drop-shadow-md">{location.icon}</span>
         <div className="flex flex-col">
            <span className="font-black text-white uppercase tracking-[0.2em] text-[10px] text-center opacity-70 leading-none">KONUM</span>
            <span className="font-bold text-white text-sm drop-shadow-md leading-tight">{location.name}</span>
         </div>
         <span className="ml-2 text-xl filter drop-shadow-md">{weather === WeatherType.STORM ? '⛈️' : weather === WeatherType.RAIN ? '🌧️' : '☀️'}</span>
      </div>

      {/* Fishing Rod Layer */}
      <FishingRodSystem gameState={gameState} rodColor={rod.color} timeOfDay={timeOfDay} bobberIcon={activeBobber.icon} />

      {/* Global Styles for Scene */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
        @keyframes fall { 0% { transform: translateY(-10%) translateX(0); } 100% { transform: translateY(110%) translateX(-20px); } }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-80px) scale(1.2); } }
        @keyframes splash { 0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0); border-width: 6px; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(3); border-width: 0px; } }
        @keyframes fishRise { 0% { transform: translateY(100px) scale(0) rotate(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-150px) scale(1.5) rotate(360deg); opacity: 0; } }
        @keyframes godray { 0% { opacity: 0; transform: rotate(-10deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: rotate(10deg); } }
        @keyframes sinkHook { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 1; } 100% { transform: translateY(120px); } }
        @keyframes castLine { 
            0% { d: path("M150,150 Q150,150 150,150"); stroke-width: 0; } 
            50% { d: path("M150,150 Q250,50 350,200"); stroke-width: 2; } 
            100% { d: path("M150,150 Q160,300 180,380"); stroke-width: 1.5; } 
        }
        @keyframes castBobber {
            0% { transform: translate(150px, 150px) scale(0); }
            50% { transform: translate(350px, 200px) scale(1); }
            100% { transform: translate(180px, 380px) scale(1); }
        }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
        @keyframes sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
        @keyframes wave { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-2%); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes moveClouds { from { transform: translateX(100%); } to { transform: translateX(-150%); } }
        @keyframes aurora { 0% { opacity: 0.3; transform: scaleX(1); } 50% { opacity: 0.6; transform: scaleX(1.1); } 100% { opacity: 0.3; transform: scaleX(1); } }
      `}</style>
    </div>
  );
};

// --------------------------------------------------------------------------------
// LOCATION SCENE RENDERER
// --------------------------------------------------------------------------------

export const LocationScene: React.FC<{ locId: number, theme: { sky: string[], water: string[], sun: string, opacity: number }, weather: WeatherType, timeOfDay: string, biome: string }> = ({ locId, theme, weather, timeOfDay, biome }) => {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  
  return (
    <div className="absolute inset-0 w-full h-full transition-all duration-[2000ms]" style={{ background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]})` }}>
       
       <svg className="w-full h-full absolute inset-0 z-0 overflow-hidden" preserveAspectRatio="none" viewBox="0 0 400 800">
          <defs>
             <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={theme.water[0]} stopOpacity="0.9"/><stop offset="100%" stopColor={theme.water[1]} stopOpacity="1"/></linearGradient>
             <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
             <filter id="blur"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>

          {/* STARS (Night Only) */}
          {isNight && (
              <g>
                 {[...Array(30)].map((_, i) => (
                     <circle key={i} cx={Math.random() * 400} cy={Math.random() * 400} r={Math.random() * 1.5} fill="white" className="animate-[twinkle_3s_infinite_ease-in-out]" style={{ animationDelay: `${Math.random() * 3}s` }} />
                 ))}
              </g>
          )}

          {/* SUN / MOON - Dynamic Position */}
          <circle 
             cx={isSunset ? "50%" : "80%"} 
             cy={isSunset ? "55%" : "15%"} 
             r={isNight ? 25 : 45} 
             fill={theme.sun} 
             filter="url(#glow)" 
             opacity={isNight ? 0.9 : 0.6}
             className="transition-all duration-[2000ms]"
          >
          </circle>

          {/* CLOUDS (Day/Sunset Only) */}
          {!isNight && (
              <g opacity={isSunset ? 0.3 : 0.6}>
                  <path d="M-50,100 Q0,80 50,100 T150,100" stroke="white" strokeWidth="20" strokeLinecap="round" filter="url(#blur)" className="animate-[moveClouds_60s_linear_infinite]" />
                  <path d="M200,150 Q250,130 300,150 T450,150" stroke="white" strokeWidth="15" strokeLinecap="round" filter="url(#blur)" className="animate-[moveClouds_45s_linear_infinite]" style={{ animationDelay: '-20s' }} />
              </g>
          )}

          {/* AURORA (Ice Biome Night Only) */}
          {biome === 'ice' && isNight && (
              <rect x="0" y="0" width="400" height="400" fill="url(#waterGrad)" className="animate-[aurora_10s_infinite_ease-in-out]" style={{ mixBlendMode: 'overlay', opacity: 0.5 }} />
          )}

          {/* --- DYNAMIC LANDSCAPES --- */}

          {/* 0: Village Creek */}
          {locId === 0 && (
             <g transform="translate(0, 100)">
                <path d="M-50,450 Q150,250 450,450" fill="#0f172a" opacity="0.3" />
                <path d="M-50,550 Q150,300 450,550" fill="#1e293b" opacity="0.6" />
                <path d="M300,450 Q400,250 500,450" fill="#1e293b" opacity="0.7" />
                
                {/* Swaying Tree */}
                <g transform="translate(100, 450)" className="animate-[sway_5s_ease-in-out_infinite] origin-bottom">
                    <path d="M0,0 L20,-100 L40,0" fill="#064e3b" />
                    <rect x="15" y="0" width="10" height="30" fill="#3f2c22" />
                </g>
             </g>
          )}

          {/* 1: Lake */}
          {locId === 1 && (
             <g transform="translate(0, 100)">
                <path d="M0,500 Q200,450 400,500" fill="#3f6212" opacity="0.8" />
                {/* Reeds */}
                {[20, 40, 60, 350, 370].map((x, i) => (
                    <path key={i} d={`M${x},500 L${x+5},420 L${x+10},500`} stroke="#3f6212" strokeWidth="3" className="animate-[sway_3s_ease-in-out_infinite] origin-bottom" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
             </g>
          )}

          {/* 5: Nile (Pyramids) */}
          {locId === 5 && (
              <g transform="translate(0, 50)">
                  <path d="M50,500 L150,350 L250,500" fill="#b45309" opacity="0.5" />
                  <path d="M200,500 L350,300 L500,500" fill="#d97706" opacity="0.8" /> 
                  <path d="M-100,500 Q200,480 500,500" fill="#fcd34d" /> {/* Dunes */}
              </g>
          )}

          {/* 8: Aegean (Columns) */}
          {locId === 8 && (
              <g transform="translate(0, 50)">
                  <path d="M-50,500 Q100,450 300,500" fill="#94a3b8" />
                  <g transform="translate(50, 350)">
                      <rect x="0" y="0" width="15" height="150" fill="#cbd5e1" />
                      <rect x="40" y="0" width="15" height="150" fill="#cbd5e1" />
                      <rect x="-10" y="-20" width="75" height="20" fill="#e2e8f0" />
                  </g>
              </g>
          )}

          {/* 9: Storm Cape (Lighthouse) */}
          {locId === 9 && (
              <g transform="translate(0, 50)">
                  <path d="M0,500 L150,350 L300,500" fill="#0f172a" />
                  <g transform="translate(130, 250)">
                      <rect x="0" y="20" width="40" height="100" fill="#cbd5e1" />
                      <path d="M0,20 L20,-10 L40,20" fill="#ef4444" />
                      {/* Rotating Light */}
                      <path d="M20,20 L-100,-50 L140,-50 Z" fill="yellow" opacity="0.3" className="animate-[sway_4s_linear_infinite] origin-bottom" />
                  </g>
              </g>
          )}

          {/* 18: Antarctica (Penguins & Ice) */}
          {locId === 18 && (
              <g transform="translate(0, 50)">
                  <path d="M0,500 L100,400 L200,500 L300,420 L400,500" fill="#e0f2fe" />
                  <g transform="translate(150, 450)">
                      <ellipse cx="0" cy="0" rx="10" ry="20" fill="#000" />
                      <ellipse cx="0" cy="0" rx="5" ry="15" fill="#fff" />
                  </g>
                  <g transform="translate(180, 460)">
                      <ellipse cx="0" cy="0" rx="8" ry="16" fill="#000" />
                      <ellipse cx="0" cy="0" rx="4" ry="12" fill="#fff" />
                  </g>
              </g>
          )}

          {/* 22: Volcano */}
          {locId === 22 && (
              <g transform="translate(0, 50)">
                  <path d="M50,500 L200,200 L350,500" fill="#1c1917" />
                  <path d="M180,200 L200,180 L220,200" fill="#ef4444" className="animate-pulse" />
                  {/* Smoke */}
                  <circle cx="200" cy="150" r="10" fill="#57534e" opacity="0.6" className="animate-[floatUp_3s_infinite]" />
                  <circle cx="210" cy="130" r="15" fill="#57534e" opacity="0.4" className="animate-[floatUp_4s_infinite]" />
              </g>
          )}

          {/* 27: Atlantis */}
          {locId === 27 && (
              <g transform="translate(0, 50)">
                  <path d="M0,550 Q200,500 400,550" fill="#0e7490" opacity="0.6" />
                  <rect x="100" y="300" width="50" height="250" fill="#155e75" opacity="0.8" rx="10" />
                  <rect x="250" y="250" width="80" height="300" fill="#155e75" opacity="0.8" rx="20" />
                  <circle cx="125" cy="320" r="10" fill="#facc15" opacity="0.6" className="animate-pulse" />
              </g>
          )}

          {/* Generic Biomes if no ID match */}
          {![0,1,5,8,9,18,22,27].includes(locId) && !([23,24,25,26].includes(locId)) && (
              <g transform="translate(0, 100)">
                 {biome === 'freshwater' && <path d="M-50,550 Q150,400 450,550" fill="#1e293b" opacity="0.5" />}
                 {biome === 'tropical' && <path d="M0,500 Q200,450 400,500" fill="#fcd34d" />}
                 {biome === 'coastal' && <path d="M300,500 L350,300 L450,500" fill="#475569" />}
                 {biome === 'ice' && <path d="M0,500 L100,300 L200,500" fill="#cbd5e1" />}
                 {biome === 'ocean' && <rect x="0" y="450" width="100%" height="50" fill="#1e3a8a" opacity="0.3" />}
              </g>
          )}

          {/* WATER SURFACE */}
          <rect x="-10%" y="65%" width="120%" height="35%" fill="url(#waterGrad)" className="animate-[wave_5s_ease-in-out_infinite]" />
          
          {/* Abyss Overlay */}
          {locId >= 23 && locId <= 26 && (
               <g className="pointer-events-none">
                   <rect width="100%" height="100%" fill="#000" opacity="0.6" />
                   {[...Array(20)].map((_,i) => (
                       <circle key={i} cx={Math.random()*400} cy={Math.random()*800} r={Math.random()} fill="white" opacity="0.3" className="animate-[float_10s_linear_infinite]" />
                   ))}
               </g>
          )}

          {/* Weather Overlay */}
          {weather !== WeatherType.SUNNY && (
             <g>
                 {[...Array(40)].map((_, i) => (
                     <line key={i} x1={Math.random() * 100 + "%"} y1={-20} x2={Math.random() * 100 - 10 + "%"} y2="120%" 
                           stroke="white" 
                           strokeWidth={weather === WeatherType.STORM ? 2 : 1} 
                           opacity={0.4} 
                           className="animate-[fall_0.6s_linear_infinite]" 
                           style={{ animationDelay: `${Math.random()}s`, animationDuration: `${0.5 + Math.random() * 0.3}s` }} 
                     />
                 ))}
                 {weather === WeatherType.STORM && <rect width="100%" height="100%" fill="white" opacity="0" className="animate-[splash_5s_infinite]" />} {/* Lightning flash hack */}
             </g>
          )}
       </svg>
       
       {/* Vignette & Day/Night Filter */}
       <div 
          className="absolute inset-0 pointer-events-none transition-all duration-[2000ms]"
          style={{ 
              background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)',
              backdropFilter: `brightness(${theme.opacity}) contrast(${isNight ? 1.2 : 1})`
          }} 
       />
    </div>
  );
};

// --- RE-EXPORT FISH RENDERER ---
export const FishRenderer: React.FC<{ visual?: FishVisual }> = ({ visual }) => {
  if (!visual) return <span>🐟</span>;
  const { shape, bodyColor, finColor, pattern } = visual;
  const uniqueId = React.useId();
  
  let bodyPath = "";
  switch (shape) {
    case 'shark': bodyPath = "M90,30 Q60,10 20,40 Q60,70 90,50 Q100,40 90,30"; break;
    case 'carp': bodyPath = "M85,35 Q60,10 20,40 Q60,70 85,45 Q95,40 85,35"; break;
    case 'trout': bodyPath = "M90,35 Q50,20 15,40 Q50,60 90,45 Q100,40 90,35"; break;
    case 'round': bodyPath = "M80,40 A30,30 0 1,1 20,40 A30,30 0 1,1 80,40"; break;
    case 'long': bodyPath = "M90,30 Q50,25 10,35 Q50,55 90,50 Q95,40 90,30"; break;
    case 'blob': bodyPath = "M50,40 Q70,10 90,40 Q70,70 50,40 Q30,70 10,40 Q30,10 50,40"; break;
    case 'boot': bodyPath = "M30,10 L60,10 L65,60 L80,60 Q90,60 90,80 L20,80 Q20,60 30,50 Z"; break;
    case 'can': bodyPath = "M30,20 H70 V80 H30 Z"; break;
    case 'coin':
    case 'ring': bodyPath = "M80,50 A30,30 0 1,1 20,50 A30,30 0 1,1 80,50"; break;
    case 'crab': bodyPath = "M20,50 Q20,30 50,30 Q80,30 80,50 Q80,70 50,70 Q20,70 20,50"; break;
    case 'swordfish': bodyPath = "M95,30 L60,25 Q30,30 10,40 Q30,50 60,55 Q80,50 85,45"; break;
    case 'catfish': bodyPath = "M85,35 Q60,15 20,40 Q60,65 85,45"; break;
    case 'eel': bodyPath = "M90,25 Q60,35 40,25 T10,40 Q30,60 60,50 T90,25"; break;
    case 'angler': bodyPath = "M80,50 A30,30 0 1,1 20,50 A30,30 0 1,1 80,50"; break;
    case 'squid': bodyPath = "M80,30 Q50,20 40,40 Q50,60 80,50 Q90,40 80,30"; break;
    case 'whale': bodyPath = "M90,40 Q60,20 20,40 Q60,80 90,60 Q95,50 90,40"; break;
    default: bodyPath = "M85,35 Q60,10 20,40 Q60,70 85,45 Q95,40 85,35";
  }
  const textureUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cyprinus_carpio_02.jpg/640px-Cyprinus_carpio_02.jpg";

  return (
    <svg viewBox="0 0 100 80" className="drop-shadow-lg overflow-visible">
      <defs>
        <clipPath id={`clip-${uniqueId}`}><path d={bodyPath} /></clipPath>
        <radialGradient id={`highlight-${uniqueId}`} cx="50%" cy="20%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.6"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
        <linearGradient id={`shadow-${uniqueId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" stopOpacity="0"/><stop offset="100%" stopColor="black" stopOpacity="0.4"/></linearGradient>
      </defs>
      <path d={bodyPath} fill={bodyColor} />
      <image href={textureUrl} x="0" y="0" width="100" height="80" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'overlay', opacity: 0.8 }} />
      <image href={textureUrl} x="0" y="0" width="100" height="80" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'luminosity', opacity: 0.4 }} />
      {pattern === 'stripes' && <path d="M40,10 V70 M50,10 V70 M60,10 V70" stroke="black" strokeWidth="2" strokeOpacity="0.2" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'multiply' }} />}
      {pattern === 'spots' && <g fill="black" fillOpacity="0.2" clipPath={`url(#clip-${uniqueId})`} style={{ mixBlendMode: 'multiply' }}><circle cx="30" cy="40" r="2" /><circle cx="50" cy="30" r="3" /><circle cx="60" cy="50" r="2" /><circle cx="70" cy="35" r="2" /></g>}
      <path d={bodyPath} fill={`url(#highlight-${uniqueId})`} style={{ mixBlendMode: 'screen' }} />
      <path d={bodyPath} fill={`url(#shadow-${uniqueId})`} style={{ mixBlendMode: 'multiply' }} />
      {shape !== 'round' && shape !== 'coin' && shape !== 'ring' && shape !== 'boot' && shape !== 'can' && (
         <>
            <path d="M45,30 L35,10 L55,10 Z" fill={finColor} opacity="0.8" style={{ mixBlendMode: 'multiply' }} transform="translate(10,0)" />
            <path d="M20,40 L5,25 L5,55 Z" fill={finColor} opacity="0.9" style={{ mixBlendMode: 'multiply' }} />
         </>
      )}
      {shape !== 'boot' && shape !== 'can' && shape !== 'coin' && shape !== 'ring' && (<g transform="translate(75, 35)"><circle r="3.5" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" /><circle r="1.5" fill="black" /><circle cx="0.8" cy="-0.8" r="0.8" fill="white" /></g>)}
      {pattern === 'shiny' && <circle cx="50" cy="40" r="30" fill="white" opacity="0.5" className="animate-pulse" style={{ mixBlendMode: 'screen' }} />}
    </svg>
  );
};

export const FishingRodSystem: React.FC<{ gameState: GameState, rodColor: string, timeOfDay: string, bobberIcon: string }> = ({ gameState, rodColor, timeOfDay, bobberIcon }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax slice">
        <g className={`transition-transform duration-700 origin-[350px_450px] ${gameState === GameState.CASTING ? 'rotate-[-35deg]' : ''}`}>
            <path d="M350,550 L150,150" stroke={rodColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="250" cy="350" r="3" fill="#333" />
            <circle cx="200" cy="250" r="3" fill="#333" />
            <path 
                d={gameState === GameState.CASTING ? "M150,150 Q250,50 350,200" : "M150,150 Q160,300 180,380"} 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="1.5" 
                fill="none" 
                className={gameState === GameState.CASTING ? 'animate-[castLine_0.5s_ease-out_forwards]' : ''}
            />
            <g 
                transform={gameState === GameState.CASTING ? "translate(350, 200)" : "translate(180, 380)"}
                className={gameState === GameState.CASTING ? 'animate-[castBobber_0.5s_ease-out_forwards]' : ''}
            >
                <g className={(gameState === GameState.WAITING || gameState === GameState.BITE) ? 'animate-[bob_1.5s_ease-in-out_infinite]' : ''}>
                    <circle r="8" fill="red" stroke="white" strokeWidth="1" />
                    <circle r="8" fill="white" clipPath="inset(50% 0 0 0)" />
                </g>
                {(gameState === GameState.WAITING || gameState === GameState.BITE) && (
                    <g className="animate-[sinkHook_3s_ease-out_forwards]">
                        <line x1="0" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                        <g transform="translate(0, 100)">
                            <path d="M-3,-5 Q0,0 3,-5 M0,-5 V5 Q0,10 4,8" stroke="silver" fill="none" strokeWidth="1.5" />
                            <circle r="2" fill="yellow" className="animate-pulse" /> 
                        </g>
                    </g>
                )}
            </g>
        </g>
      </svg>
    </div>
  );
};
