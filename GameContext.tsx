
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { PlayerStats, CatchItem, Quest, GameState, WeatherType, SavedGame, PediaEntry, FishBase, ItemType, Skill, FloatingText, CatchVisual, LifetimeStats, TournamentState, Bounty } from './types';
import { RODS, LOCATIONS, FISH_DB, BAITS } from './constants';

interface GameContextType {
  stats: PlayerStats;
  bag: CatchItem[];
  aquarium: CatchItem[];
  gameState: GameState;
  activeFish: FishBase | null;
  weather: WeatherType;
  quests: Quest[];
  skills: Record<string, number>;
  unlockedLocs: number[];
  ownedRods: number[];
  pedia: Record<string, PediaEntry>;
  toast: { msg: string; color: string; sub?: string } | null;
  floatingTexts: FloatingText[];
  celebrationFish: CatchItem | null;
  catchVisual: CatchVisual | null;
  isMuted: boolean;
  lifetimeStats: LifetimeStats;
  
  // Competitive
  combo: number;
  tournament: TournamentState;
  bounty: Bounty;
  closeTournamentResult: () => void;
  
  // Actions
  castRod: () => void;
  reelIn: (success: boolean, snapped: boolean, fishOverride?: FishBase) => void;
  sellItem: (id: string, fromAqua?: boolean) => void;
  sellAll: () => void;
  recycleJunk: () => void;
  buyItem: (type: 'rod' | 'bait' | 'upgrade' | 'location', id: number | string) => void;
  equipRod: (id: number) => void;
  repairRod: () => void;
  travel: (id: number) => void;
  claimQuest: (index: number) => void;
  moveToAqua: (id: string) => void;
  upgradeSkill: (id: string) => void;
  resetGame: () => void;
  startNewGame: () => void; // Added
  closeCelebration: () => void;
  playSound: (type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl') => void;
  toggleMute: () => void;
  getRank: () => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};

const INITIAL_STATS: PlayerStats = {
  money: 0, xp: 0, level: 1, rodId: 0, rodHp: 10, locId: 0, bagLimit: 5, aquaLimit: 7, baitId: null
};

const INITIAL_LIFETIME: LifetimeStats = {
  totalCaught: 0,
  totalMoneyEarned: 0,
  heaviestFish: 0,
  legendariesCaught: 0,
  playTimeMinutes: 0
};

const AI_NAMES = ["Kaptan Ali", "Denizci Can", "Balıkçı Efe", "Rastgele Reis"];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(INITIAL_LIFETIME);
  const [bag, setBag] = useState<CatchItem[]>([]);
  const [aquarium, setAquarium] = useState<CatchItem[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [activeFish, setActiveFish] = useState<FishBase | null>(null);
  const [weather, setWeather] = useState<WeatherType>(WeatherType.SUNNY);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questCooldown, setQuestCooldown] = useState(0);
  const [skills, setSkills] = useState<Record<string, number>>({ luck: 0, haggle: 0, repair: 0, biology: 0 });
  const [unlockedLocs, setUnlockedLocs] = useState<number[]>([0]);
  const [ownedRods, setOwnedRods] = useState<number[]>([0]);
  const [pedia, setPedia] = useState<Record<string, PediaEntry>>({});
  const [toast, setToast] = useState<{ msg: string; color: string; sub?: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Visuals
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [celebrationFish, setCelebrationFish] = useState<CatchItem | null>(null);
  const [catchVisual, setCatchVisual] = useState<CatchVisual | null>(null);

  // COMPETITIVE STATES
  const [combo, setCombo] = useState(0);
  const [tournament, setTournament] = useState<TournamentState>({
    active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null
  });
  const [bounty, setBounty] = useState<Bounty>({
    active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0
  });

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const getRank = useCallback(() => {
    const total = lifetimeStats.totalCaught;
    const legend = lifetimeStats.legendariesCaught;
    
    if (legend >= 50) return "BALIKÇI KRAL 👑";
    if (legend >= 10) return "EFSANEVİ USTA";
    if (total >= 1000) return "Deniz Kurdu";
    if (total >= 500) return "Usta Balıkçı";
    if (total >= 100) return "Tecrübeli";
    if (total >= 50) return "Hevesli";
    return "Acemi";
  }, [lifetimeStats]);

  // --- Sound System ---
  const playSound = useCallback((type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl') => {
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      
      if (ctx.state === 'closed') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'cast') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); 
        osc.frequency.setValueAtTime(554, now + 0.1); 
        osc.frequency.setValueAtTime(659, now + 0.2); 
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'cash') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'lvl') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 1);
        osc.start(now);
        osc.stop(now + 1);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) { }
  }, [isMuted]);

  // --- Helper: Show Toast ---
  const showToast = useCallback((msg: string, color: string, sub?: string) => {
    setToast({ msg, color, sub });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // --- Helper: Spawn Floating Text ---
  const spawnText = useCallback((text: string, color: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  // --- Initialization & Save/Load ---
  useEffect(() => {
    const saved = localStorage.getItem("balikciHasanSave_v5");
    if (saved) {
      try {
        const data: SavedGame = JSON.parse(saved);
        setStats(data.stats);
        setBag(data.bag);
        setAquarium(data.aquarium);
        setUnlockedLocs(data.unlockedLocs);
        setOwnedRods(data.ownedRods);
        setSkills(data.skills);
        setPedia(data.pedia);
        setQuests(data.quests);
        setQuestCooldown(data.questCooldown);
        if (data.lifetimeStats) setLifetimeStats(data.lifetimeStats);
        
        // Offline income calculation
        const now = Date.now();
        const diffMins = (now - data.lastLogin) / 60000;
        if (diffMins > 10 && data.aquarium.length > 0) {
          let income = 0;
          data.aquarium.forEach(f => { income += (f.rarity > 1 ? f.rarity * 5 : 2); });
          const totalOffline = Math.floor(income * Math.min(diffMins, 1440)); // Max 24h
          if (totalOffline > 0) {
            setStats(prev => ({ ...prev, money: prev.money + totalOffline }));
            setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + totalOffline }));
            setTimeout(() => {
               showToast(`Hoşgeldin! Akvaryum kazancı: ${totalOffline} TL`, "text-amber-400");
               playSound('cash');
            }, 1000);
          }
        }
      } catch (e) {
        console.error("Save file corrupted", e);
      }
    } else {
      generateQuests(INITIAL_STATS.locId);
    }
  }, [showToast, playSound]);

  useEffect(() => {
    const data: SavedGame = {
      stats, bag, aquarium, unlockedLocs, ownedRods, skills, pedia, quests, questCooldown,
      lastLogin: Date.now(), lifetimeStats
    };
    localStorage.setItem("balikciHasanSave_v5", JSON.stringify(data));
  }, [stats, bag, aquarium, unlockedLocs, ownedRods, skills, pedia, quests, questCooldown, lifetimeStats]);

  // --- Competitive Logic Loops ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tournament Logic
      if (tournament.active) {
        setTournament(prev => {
          if (prev.timeLeft <= 1) {
            // End Tournament
            const finalAiScores = prev.aiScores;
            // Sort to find rank
            const allScores = [...finalAiScores.map(x => x.score), prev.playerScore].sort((a,b) => b-a);
            const rank = allScores.indexOf(prev.playerScore) + 1;
            
            // Reward
            if (rank === 1) {
                setStats(s => ({...s, money: s.money + 5000}));
                showToast("TURNUVA ŞAMPİYONU!", "text-yellow-400", "+5000 TL");
            } else if (rank === 2) {
                setStats(s => ({...s, money: s.money + 2000}));
                showToast("Turnuva 2.si!", "text-slate-200", "+2000 TL");
            }

            return { ...prev, active: false, timeLeft: 0, finished: true, rank };
          }
          
          // AI Score Simulation (BALANCED: Low chance for a burst of points, mimicking fish catch)
          // Old: Every second +0-50 points.
          // New: 10% chance per second to get 50-250 points.
          const newAiScores = prev.aiScores.map(ai => {
             const caughtFish = Math.random() < 0.10; 
             const points = caughtFish ? Math.floor(Math.random() * 200) + 50 : 0;
             return { ...ai, score: ai.score + points };
          });
          
          return { ...prev, timeLeft: prev.timeLeft - 1, aiScores: newAiScores };
        });
      } else {
         // Randomly Start Tournament
         if (!tournament.finished && Math.random() < 0.005) { // Low chance every second
            startTournament();
         }
      }

      // 2. Bounty Logic
      if (bounty.active) {
         setBounty(prev => {
             if (prev.timeLeft <= 1) return { ...prev, active: false, timeLeft: 0 };
             return { ...prev, timeLeft: prev.timeLeft - 1 };
         });
      } else {
         // Randomly Generate Bounty
         if (Math.random() < 0.01) {
            generateBounty();
         }
      }

    }, 1000);
    return () => clearInterval(interval);
  }, [tournament.active, bounty.active, tournament.finished, showToast]);

  const startTournament = () => {
    setTournament({
        active: true,
        timeLeft: 60,
        playerScore: 0,
        aiScores: AI_NAMES.map(name => ({ name, score: 0 })),
        finished: false,
        rank: null
    });
    showToast("🏆 TURNUVA BAŞLADI!", "text-yellow-400", "60 Saniye!");
  };

  const closeTournamentResult = () => {
    setTournament(prev => ({ ...prev, finished: false }));
  };

  const generateBounty = () => {
    // Pick random location and fish
    const locId = Math.floor(Math.random() * LOCATIONS.length);
    const fishes = FISH_DB[locId].filter(f => f.type === ItemType.FISH);
    if (!fishes.length) return;
    
    const target = fishes[Math.floor(Math.random() * fishes.length)];
    const minW = Math.floor((Math.random() * 2 + 1) * 10) / 10;
    
    setBounty({
        active: true,
        locId,
        fishName: target.name,
        minWeight: minW,
        reward: target.value * 10,
        timeLeft: 300 // 5 mins
    });
    showToast("📜 YENİ ARANAN!", "text-orange-400", `${target.name} (${LOCATIONS[locId].name})`);
  };

  // --- Game Loop Systems ---
  
  // Playtime Tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setLifetimeStats(prev => ({ ...prev, playTimeMinutes: prev.playTimeMinutes + 1 }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Weather Cycle
  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.15) { setWeather(WeatherType.STORM); showToast("Fırtına Çıktı!", "text-slate-400"); }
      else if (r < 0.4) { setWeather(WeatherType.RAIN); showToast("Yağmur Başladı", "text-blue-300"); }
      else setWeather(WeatherType.SUNNY);
    }, 60000);
    return () => clearInterval(interval);
  }, [showToast]);

  // Passive Aquarium Income & Breeding
  useEffect(() => {
    const interval = setInterval(() => {
      // Income
      if (aquarium.length > 0) {
        let income = 0;
        aquarium.forEach(f => { income += (f.rarity > 1 ? f.rarity * 5 : 2); });
        setStats(prev => ({ ...prev, money: prev.money + income }));
        setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + income }));
        if (gameState === GameState.IDLE) {
           spawnText(`+${income} TL (Akvaryum)`, "text-yellow-400", 20, 80);
        }
      }

      // Breeding
      if (aquarium.length < stats.aquaLimit) {
        const counts: Record<string, number> = {};
        aquarium.forEach(f => counts[f.name] = (counts[f.name] || 0) + 1);
        
        for (const name in counts) {
          if (counts[name] >= 2) {
            if (Math.random() < 0.05) {
              const parent = aquarium.find(f => f.name === name);
              if (parent) {
                const baby: CatchItem = { ...parent, weight: Number((Math.random() * parent.weight).toFixed(2)), id: Date.now().toString() };
                setAquarium(prev => [...prev, baby]);
                setLifetimeStats(prev => ({ ...prev, totalCaught: prev.totalCaught + 1 }));
                if (gameState === GameState.IDLE) showToast(`Yavru doğdu: ${name}!`, "text-pink-400");
                break;
              }
            }
          }
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [aquarium, stats.aquaLimit, gameState, showToast, spawnText]);

  // --- Actions ---

  const generateQuests = (locId: number) => {
    const mult = locId + 1;
    const newQuests: Quest[] = [
      { id: Date.now(), desc: "3 Balık Tut", target: 3, current: 0, reward: 100 * mult, claimed: false, type: 'count' },
      { id: Date.now()+1, desc: "Gelir Elde Et", target: 200 * mult, current: 0, reward: 150 * mult, claimed: false, type: 'money' },
      { id: Date.now()+2, desc: "1 Nadir+ Balık", target: 1, current: 0, reward: 250 * mult, claimed: false, type: 'rare' }
    ];
    setQuests(newQuests);
    setQuestCooldown(0);
  };

  const castRod = () => {
    playSound('click');
    if (stats.rodHp <= 0) { showToast("⚠️ Olta Kırık!", "text-red-500"); return; }
    if (bag.length >= stats.bagLimit) { showToast("⚠️ Çanta Dolu!", "text-orange-400"); return; }
    
    setGameState(GameState.CASTING);
    playSound('cast');
    
    setTimeout(() => {
      setGameState(GameState.WAITING);
      let waitTime = 2000 + Math.random() * 3000;
      if (weather === WeatherType.RAIN) waitTime *= 0.8;
      
      setTimeout(() => {
        setGameState(GameState.BITE);
        pickFish();
      }, waitTime);
    }, 500);
  };

  const pickFish = () => {
    const pool = FISH_DB[stats.locId];
    const rod = RODS[stats.rodId];
    const baitBonus = stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.bonus || 1 : 1;
    
    let totalW = 0;
    const wPool = pool.map(f => {
      let w = 100 / Math.pow(2, f.rarity);
      
      if (f.type !== ItemType.JUNK) {
        w *= (rod.power * baitBonus * (1 + skills['luck'] * 0.1));
        if (weather === WeatherType.RAIN) w *= 1.2;
      } else {
        w /= (rod.power * 1.5); 
      }
      
      totalW += w;
      return { ...f, weightVal: w };
    });
    
    let r = Math.random() * totalW;
    let selected = wPool[0];
    for (const f of wPool) {
      if (r < f.weightVal) { selected = f; break; }
      r -= f.weightVal;
    }
    
    setActiveFish(selected);
    
    if (selected.type === ItemType.JUNK) {
      setTimeout(() => reelIn(true, false, selected), 500);
    } else {
      setGameState(GameState.MINIGAME);
    }
  };

  const reelIn = (success: boolean, snapped: boolean, fishOverride?: FishBase) => {
    // Determine which fish object to use (override from auto-catch or activeFish from state)
    const currentFish = fishOverride || activeFish;

    if (snapped) {
      setGameState(GameState.BROKEN);
      setStats(prev => ({ ...prev, rodHp: Math.max(0, prev.rodHp - 3) }));
      showToast("MİSİNA KOPTU!", "text-red-500");
      setCombo(0); // Break Combo
      playSound('fail');
    } else if (success && currentFish) {
      setGameState(GameState.CAUGHT);
      playSound('success');
      
      // FIX: Reset combo if JUNK, otherwise increment
      if (currentFish.type !== ItemType.JUNK) {
         setCombo(prev => {
            const next = prev + 1;
            // Immediate feedback for combo
            if (next > 1) spawnText(`COMBO x${next}`, "text-purple-400", 50, 25);
            return next;
         });
      } else {
         setCombo(0);
         showToast("ÇÖP! Combo Sıfırlandı", "text-slate-400");
      }
      
      // Calculate weight based on skill
      const baseW = (Math.random() * 5 + 1) * (1 + skills['biology'] * 0.2) * (1 + stats.locId * 0.2);
      const finalWeight = Number(baseW.toFixed(2));
      
      const caughtItem: CatchItem = { ...currentFish, weight: finalWeight, id: Date.now().toString() };
      
      // Trigger Catch Animation Visuals
      setCatchVisual({ emoji: caughtItem.emoji, rarity: caughtItem.rarity, id: Date.now() });

      // Delay actual data processing to let animation play
      setTimeout(() => {
        setBag(prev => [...prev, caughtItem]);
        
        // Stats update
        const xpGain = Math.floor(currentFish.rarity * 12 * (1 + stats.locId * 0.1));
        
        setStats(prev => {
          let newXp = prev.xp + xpGain;
          let newLvl = prev.level;
          let lvlUp = false;
          if (newXp >= prev.level * 300) {
             newXp -= prev.level * 300;
             newLvl++;
             lvlUp = true;
          }
          if (lvlUp) {
            setTimeout(() => { playSound('lvl'); showToast("SEVİYE ATLADIN!", "text-yellow-400", `Akvaryum Kapasitesi: ${5 + newLvl * 2}`); }, 500);
          }
          return {
            ...prev,
            xp: newXp,
            level: newLvl,
            rodHp: Math.max(0, prev.rodHp - (1 - skills['repair'] * 0.1)),
            aquaLimit: 5 + newLvl * 2
          };
        });

        // Lifetime Stats
        setLifetimeStats(prev => ({
          ...prev,
          totalCaught: prev.totalCaught + 1,
          heaviestFish: Math.max(prev.heaviestFish, finalWeight),
          legendariesCaught: prev.legendariesCaught + (currentFish.rarity >= 5 ? 1 : 0)
        }));

        // Pedia
        setPedia(prev => ({
          ...prev,
          [currentFish.name]: {
            count: (prev[currentFish.name]?.count || 0) + 1,
            maxWeight: Math.max(prev[currentFish.name]?.maxWeight || 0, finalWeight)
          }
        }));

        // Quests
        setQuests(prev => prev.map(q => {
          if (q.claimed) return q;
          if (q.type === 'count' && currentFish.type !== ItemType.JUNK) return { ...q, current: q.current + 1 };
          if (q.type === 'rare' && currentFish.rarity >= 3) return { ...q, current: q.current + 1 };
          return q;
        }));

        spawnText(`+${xpGain} XP`, "text-blue-400", 70, 40);

        // --- NEW COMPETITIVE CHECKS ---
        
        // 1. Tournament Points (Use currentFish and finalWeight)
        if (tournament.active && currentFish.type !== ItemType.JUNK) {
           const points = Math.floor(currentFish.rarity * 10 * finalWeight);
           setTournament(t => ({ ...t, playerScore: t.playerScore + points }));
           spawnText(`+${points} Puan!`, "text-orange-500", 50, 60);
        }

        // 2. Bounty Check
        if (bounty.active && stats.locId === bounty.locId && currentFish.name === bounty.fishName && finalWeight >= bounty.minWeight) {
           setStats(s => ({ ...s, money: s.money + bounty.reward }));
           setBounty(b => ({ ...b, active: false }));
           showToast("ARANAN YAKALANDI!", "text-green-400", `+${bounty.reward} TL`);
           playSound('cash');
        }

        // Celebration or Toast
        if (currentFish.type === ItemType.FISH && currentFish.rarity >= 5) {
          setCelebrationFish(caughtItem);
        } else {
          showToast(`+ ${currentFish.name}`, currentFish.type === ItemType.TREASURE ? 'text-yellow-400' : 'text-white');
        }
        
        // Remove bait
        if (stats.baitId && Math.random() > 0.5) setStats(prev => ({ ...prev, baitId: null }));
        
        setCatchVisual(null);
      }, 1000); // Wait for animation
    } else {
      setGameState(GameState.IDLE);
      setStats(prev => ({ ...prev, rodHp: Math.max(0, prev.rodHp - 1) }));
      showToast("KAÇTI!", "text-slate-400");
      setCombo(0); // Break combo
      playSound('fail');
    }

    setTimeout(() => {
       if (!celebrationFish) setGameState(GameState.IDLE);
       
       // Quest Rotation
       if (quests.every(q => q.claimed)) {
          setQuestCooldown(prev => prev + 1);
          if (questCooldown >= 10) generateQuests(stats.locId);
       }
    }, 1500);
  };
  
  const closeCelebration = useCallback(() => {
    setCelebrationFish(null);
    setGameState(GameState.IDLE);
  }, []);

  const sellItem = (id: string, fromAqua = false) => {
    playSound('click');
    const list = fromAqua ? aquarium : bag;
    const item = list.find(i => i.id === id);
    if (!item) return;

    // COMBO BONUS APPLIED HERE
    const comboMultiplier = 1 + (combo * 0.1);
    const basePrice = Math.floor(item.value * (1 + skills['haggle'] * 0.1));
    const finalPrice = Math.floor(basePrice * comboMultiplier);

    setStats(prev => ({ ...prev, money: prev.money + finalPrice }));
    setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + finalPrice }));
    
    if (fromAqua) setAquarium(prev => prev.filter(i => i.id !== id));
    else setBag(prev => prev.filter(i => i.id !== id));

    setQuests(prev => prev.map(q => {
      if (!q.claimed && q.type === 'money') return { ...q, current: q.current + finalPrice };
      return q;
    }));

    spawnText(`+${finalPrice} TL`, combo > 0 ? "text-purple-400" : "text-yellow-400", 50, 50);
    if (combo > 0) {
        spawnText(`Bonus: +${Math.floor(finalPrice - basePrice)}`, "text-pink-400", 50, 40);
    }
    playSound('cash');
  };

  const sellAll = () => {
    playSound('click');
    if (bag.length === 0) return;
    let total = 0;
    // COMBO BONUS APPLIED HERE TOO
    const comboMultiplier = 1 + (combo * 0.1);
    
    bag.forEach(i => {
       if (i.type !== ItemType.JUNK) total += Math.floor(i.value * (1 + skills['haggle'] * 0.1) * comboMultiplier);
       else total += 1;
    });

    setStats(prev => ({ ...prev, money: prev.money + total }));
    setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + total }));
    setBag([]);
    
    setQuests(prev => prev.map(q => {
      if (!q.claimed && q.type === 'money') return { ...q, current: q.current + total };
      return q;
    }));
    
    // Calculate total base for comparison
    let baseTotal = 0;
    bag.forEach(i => {
       if (i.type !== ItemType.JUNK) baseTotal += Math.floor(i.value * (1 + skills['haggle'] * 0.1));
       else baseTotal += 1;
    });

    showToast(`Tümü Satıldı: +${total} TL`, "text-yellow-400");
    if (total > baseTotal) {
        spawnText(`Combo Bonus: +${total - baseTotal} TL`, "text-pink-400", 50, 40);
    }
    playSound('cash');
  };

  const recycleJunk = () => {
    playSound('click');
    const junks = bag.filter(i => i.type === ItemType.JUNK);
    if (junks.length < 5) { showToast("Yetersiz Çöp (Min 5)", "text-red-400"); return; }
    
    // Remove 5 junk
    let removed = 0;
    setBag(prev => prev.filter(item => {
        if (item.type === ItemType.JUNK && removed < 5) {
            removed++;
            return false;
        }
        return true;
    }));
    
    // Give random bait
    const bait = BAITS[Math.floor(Math.random() * 3)]; // Low tier bait
    setStats(prev => ({ ...prev, baitId: bait.id }));
    showToast(`Dönüştürüldü: ${bait.name}`, "text-emerald-400");
    playSound('success');
  };

  const buyItem = (type: 'rod' | 'bait' | 'upgrade' | 'location', id: number | string) => {
    playSound('click');
    let cost = 0;
    if (type === 'rod') cost = RODS.find(r => r.id === id)?.price || 0;
    if (type === 'bait') cost = BAITS.find(b => b.id === id)?.price || 0;
    if (type === 'location') cost = LOCATIONS.find(l => l.id === id)?.price || 0;
    if (type === 'upgrade' && id === 'bag') cost = 500;

    if (stats.money >= cost) {
      setStats(prev => ({ ...prev, money: prev.money - cost }));
      playSound('cash');
      
      if (type === 'rod') {
        setOwnedRods(prev => [...prev, Number(id)]);
        setStats(prev => ({ ...prev, rodId: Number(id), rodHp: RODS.find(r => r.id === id)!.maxHp }));
        showToast("Yeni Olta Alındı!", "text-white");
      }
      if (type === 'bait') {
        setStats(prev => ({ ...prev, baitId: String(id) }));
        showToast("Yem Takıldı", "text-emerald-400");
      }
      if (type === 'location') {
        setUnlockedLocs(prev => [...prev, Number(id)]);
        travel(Number(id));
      }
      if (type === 'upgrade') {
        setStats(prev => ({ ...prev, bagLimit: prev.bagLimit + 5 }));
        showToast("Çanta Genişletildi", "text-blue-400");
      }
    } else {
      showToast("Yetersiz Bakiye", "text-red-500");
      playSound('fail');
    }
  };

  const equipRod = (id: number) => {
    playSound('click');
    setStats(prev => ({ ...prev, rodId: id, rodHp: RODS[id].maxHp }));
    showToast("Olta Kuşanıldı", "text-white");
  };

  const repairRod = () => {
    playSound('click');
    if (stats.money >= 50) {
      setStats(prev => ({ ...prev, money: prev.money - 50, rodHp: RODS[prev.rodId].maxHp }));
      showToast("Tamir Edildi", "text-blue-400");
      playSound('success');
    }
  };

  const travel = (id: number) => {
    playSound('click');
    setStats(prev => ({ ...prev, locId: id }));
    generateQuests(id);
    showToast(`Konum: ${LOCATIONS[id].name}`, "text-white");
  };

  const claimQuest = (index: number) => {
    playSound('click');
    const q = quests[index];
    if (q.claimed) return;
    setStats(prev => ({ ...prev, money: prev.money + q.reward }));
    setLifetimeStats(prev => ({ ...prev, totalMoneyEarned: prev.totalMoneyEarned + q.reward }));
    setQuests(prev => {
      const copy = [...prev];
      copy[index].claimed = true;
      return copy;
    });
    spawnText(`+${q.reward} TL`, "text-yellow-400");
    playSound('cash');
  };

  const moveToAqua = (id: string) => {
    playSound('click');
    if (aquarium.length >= stats.aquaLimit) { showToast("Akvaryum Dolu!", "text-red-500"); return; }
    const item = bag.find(i => i.id === id);
    if (item) {
      setBag(prev => prev.filter(i => i.id !== id));
      setAquarium(prev => [...prev, item]);
      showToast("Akvaryuma Eklendi", "text-cyan-400");
    }
  };

  const upgradeSkill = (id: string) => {
    playSound('click');
    const lvl = skills[id] || 0;
    const cost = (lvl + 1) * 500;
    if (stats.money >= cost) {
      setStats(prev => ({ ...prev, money: prev.money - cost }));
      setSkills(prev => ({ ...prev, [id]: lvl + 1 }));
      showToast("Yetenek Geliştirildi", "text-purple-400");
      playSound('lvl');
    }
  };

  const resetGame = () => {
    localStorage.removeItem("balikciHasanSave_v5");
    window.location.reload();
  };

  const startNewGame = () => {
    playSound('click');
    setStats(INITIAL_STATS);
    setLifetimeStats(INITIAL_LIFETIME);
    setBag([]);
    setAquarium([]);
    setGameState(GameState.IDLE);
    setActiveFish(null);
    setWeather(WeatherType.SUNNY);
    setSkills({ luck: 0, haggle: 0, repair: 0, biology: 0 });
    setUnlockedLocs([0]);
    setOwnedRods([0]);
    setPedia({});
    setTournament({ active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null });
    setBounty({ active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0 });
    setCombo(0);
    generateQuests(0);
    localStorage.removeItem("balikciHasanSave_v5");
    showToast("Yeni Oyun Başlatıldı", "text-white");
  };

  return (
    <GameContext.Provider value={{
      stats, bag, aquarium, gameState, activeFish, weather, quests, skills, unlockedLocs, ownedRods, pedia, toast, floatingTexts, celebrationFish, catchVisual, isMuted, lifetimeStats,
      combo, tournament, bounty, closeTournamentResult,
      castRod, reelIn, sellItem, sellAll, recycleJunk, buyItem, equipRod, repairRod, travel, claimQuest, moveToAqua, upgradeSkill, resetGame, startNewGame, closeCelebration, playSound, toggleMute, getRank
    }}>
      {children}
    </GameContext.Provider>
  );
};
