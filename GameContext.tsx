
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  PlayerStats, CatchItem, Quest, GameState, WeatherType, PediaEntry, 
  FishBase, ItemType, FloatingText, CatchVisual, LifetimeStats, TournamentState, 
  Bounty, MarketTrend, OwnedPet, MysteryMerchant, RadioStation, RestaurantState, Customer, GameEvent
} from './types';
import { RODS, FISH_DB, BAITS, BOBBERS, CHARMS, ACHIEVEMENTS, PRESTIGE_UPGRADES, CRAFTING_RECIPES } from './constants';

interface GameContextType {
  stats: PlayerStats;
  bag: CatchItem[];
  aquarium: CatchItem[];
  gameState: GameState;
  activeFish: FishBase | null;
  weather: WeatherType;
  quests: Quest[];
  questCooldown: number;
  skills: Record<string, number>;
  unlockedLocs: number[];
  ownedRods: number[];
  ownedBobbers: string[];
  ownedDecor: string[];
  activeDecor: string[];
  achievements: string[];
  pedia: Record<string, PediaEntry>;
  toast: { msg: string; color: string; sub?: string } | null;
  floatingTexts: FloatingText[];
  celebrationFish: CatchItem | null;
  catchVisual: CatchVisual | null;
  isMuted: boolean;
  lifetimeStats: LifetimeStats;
  dailyFortune: string;
  timeOfDay: 'day' | 'sunset' | 'night';
  
  combo: number;
  tournament: TournamentState;
  bounty: Bounty;
  closeTournamentResult: () => void;
  
  filterExpiry: number;
  cleanAquarium: () => void;
  marketTrend: MarketTrend | null;
  marketMultipliers: Record<string, number>; 
  rodMastery: Record<number, number>;
  supplyCrate: { active: boolean; x: number; y: number } | null;
  collectCrate: () => void;
  activeDiscount: boolean;
  mysteryMerchant: MysteryMerchant | null;
  
  ecologyScore: number;
  buffs: { xpBoostExpiry: number; goldenHook: boolean };
  visitorTip: { active: boolean; amount: number } | null;
  collectVisitorTip: () => void;
  rerollFortune: () => void;
  cookFish: (id: string) => void;

  autoNetLevel: number;
  ownedCharms: string[];
  mapParts: number;
  spinAvailable: number;
  settings: { sortMode: 'recent' | 'value' | 'weight'; bulkSellSafe: boolean };
  newsTicker: string;
  bankDeposit: (amount: number) => void;
  bankWithdraw: (amount: number) => void;
  upgradeAutoNet: () => void;
  upgradeWormFarm: () => void;
  spinWheel: () => void;
  toggleSetting: (key: 'sortMode' | 'bulkSellSafe') => void;
  collectOfflineEarnings: () => void;
  offlineEarningsModal: number | null;

  ownedPets: OwnedPet[];
  buyPet: (id: string) => void;
  feedPet: (id: string) => void;

  prestigeUpgrades: Record<string, number>;
  doPrestige: () => void;
  buyPrestigeUpgrade: (id: string) => void;
  calculatePrestigePearls: () => number;
  
  donateFish: (id: string) => void;
  craftItem: (recipeId: string) => void;
  buyMerchantItem: (idx: number) => void;

  castRod: () => void;
  reelIn: (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => void;
  sellItem: (id: string, fromAqua?: boolean) => void;
  useItem: (id: string) => void;
  sellAll: () => void;
  recycleJunk: () => void;
  buyItem: (type: 'rod' | 'bait' | 'upgrade' | 'location' | 'bobber' | 'decor' | 'buff' | 'charm', id: number | string) => void;
  equipRod: (id: number) => void;
  equipBobber: (id: string) => void;
  toggleDecor: (id: string) => void;
  repairRod: () => void;
  travel: (id: number) => void;
  claimQuest: (index: number) => void;
  moveToAqua: (id: string) => void;
  upgradeSkill: (id: string) => void;
  resetGame: () => void;
  startNewGame: () => void;
  closeCelebration: () => void;
  playSound: (type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl' | 'splash') => void;
  toggleMute: () => void;
  getRank: () => string;
  generateQuests: (locId: number) => void;
  startDiving: () => void;
  endDiving: (score: number) => void;

  radioStation: RadioStation;
  cycleRadio: () => void;
  hookFish: () => void;
  playSlotMachine: (bet: number) => { result: string[]; reward: number; winType: 'none' | 'small' | 'big' | 'jackpot' };
  
  dailyRewardPopup: { active: boolean; streak: number; reward: number } | null;
  claimDailyReward: () => void;

  restaurant: RestaurantState;
  activeCustomers: Customer[];
  buyIngredient: (type: 'vegetables' | 'meze' | 'raki' | 'oil', amount: number, cost: number) => void;
  serveCustomer: (customerId: number, fishId: string) => void;
  rejectCustomer: (customerId: number) => void;
  isRestaurantOpen: boolean;
  setIsRestaurantOpen: (open: boolean) => void;
  unlockRestaurant: () => void;

  activeEvent: GameEvent | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};

const INITIAL_STATS: PlayerStats = {
  money: 0, xp: 0, level: 1, rodId: 0, rodHp: 10, locId: 0, bagLimit: 5, aquaLimit: 7, baitId: null, bobberId: 'basic', bankBalance: 0,
  pearls: 0, prestigeLevel: 0, wormFarmLevel: 0, dailyStreak: 0, lastRewardTime: 0
};

const INITIAL_RESTAURANT: RestaurantState = {
  isUnlocked: false,
  level: 1,
  ingredients: { vegetables: 0, meze: 0, raki: 0, oil: 0 },
  reputation: 0
};

const INITIAL_LIFETIME: LifetimeStats = {
  totalCaught: 0,
  totalMoneyEarned: 0,
  heaviestFish: 0,
  legendariesCaught: 0,
  playTimeMinutes: 0,
  shinyCaught: 0,
  goldenCaught: 0,
  offlineEarnings: 0
};

const FORTUNES = [
  "Bugün şansın yaver gidecek!",
  "Sular bugün çok durgun...",
  "Büyük balıklar derinlerde bekliyor.",
  "Rüzgar senden yana esiyor.",
  "Parlak bir şey görebilirsin!",
  "Balıklar bugün çok aç!",
  "İyi bir av seni bekliyor."
];

const NEWS_HEADLINES = [
  "BORSA: Balık fiyatlarında artış bekleniyor!",
  "HAVA DURUMU: Yarın fırtına uyarısı.",
  "ŞEHİR: Yeni bir balık restoranı açıldı, talep artıyor.",
  "EKOLOJİ: Deniz temizliği çalışmaları hız kazandı.",
  "BİLİM: Nadir bir balık türü keşfedildi.",
  "BANKA: Faiz oranları sabit kaldı (%1/dk).",
  "İPUCU: Gece avlanan balıklar daha değerlidir.",
  "DEDİKODU: Gizemli Tüccar bu aralar sık görülüyor."
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [ownedBobbers, setOwnedBobbers] = useState<string[]>(['basic']);
  const [ownedDecor, setOwnedDecor] = useState<string[]>([]);
  const [activeDecor, setActiveDecor] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [pedia, setPedia] = useState<Record<string, PediaEntry>>({});
  const [toast, setToast] = useState<{ msg: string; color: string; sub?: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [dailyFortune, setDailyFortune] = useState(FORTUNES[0]);
  
  const [rodMastery, setRodMastery] = useState<Record<number, number>>({});
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [marketMultipliers, setMarketMultipliers] = useState<Record<string, number>>({}); 
  const [supplyCrate, setSupplyCrate] = useState<{ active: boolean; x: number; y: number } | null>(null);
  const [activeDiscount, setActiveDiscount] = useState(false);
  const [ecologyScore, setEcologyScore] = useState(0);
  const [buffs, setBuffs] = useState({ xpBoostExpiry: 0, goldenHook: false });
  const [visitorTip, setVisitorTip] = useState<{ active: boolean; amount: number } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');

  const [autoNetLevel, setAutoNetLevel] = useState(0);
  const [ownedCharms, setOwnedCharms] = useState<string[]>([]);
  const [mapParts, setMapParts] = useState(0);
  const [spinAvailable, setSpinAvailable] = useState(0); 
  const [settings, setSettings] = useState<{ sortMode: 'recent' | 'value' | 'weight'; bulkSellSafe: boolean }>({ sortMode: 'recent', bulkSellSafe: false });
  const [newsTicker, setNewsTicker] = useState(NEWS_HEADLINES[0]);
  const [offlineEarningsModal, setOfflineEarningsModal] = useState<number | null>(null);
  
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([]);
  
  const [prestigeUpgrades, setPrestigeUpgrades] = useState<Record<string, number>>({});
  const [mysteryMerchant, setMysteryMerchant] = useState<MysteryMerchant | null>(null);

  // Restaurant State
  const [restaurant, setRestaurant] = useState<RestaurantState>(INITIAL_RESTAURANT);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);

  // Global Event State
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [celebrationFish, setCelebrationFish] = useState<CatchItem | null>(null);
  const [catchVisual, setCatchVisual] = useState<CatchVisual | null>(null);

  const [combo, setCombo] = useState(0);
  const [tournament, setTournament] = useState<TournamentState>({
    active: false, timeLeft: 0, playerScore: 0, aiScores: [], finished: false, rank: null
  });
  const [bounty, setBounty] = useState<Bounty>({
    active: false, fishName: '', minWeight: 0, locId: 0, reward: 0, timeLeft: 0
  });
  
  const [filterExpiry, setFilterExpiry] = useState(0);
  const [radioStation, setRadioStation] = useState<RadioStation>('off');
  
  const [dailyRewardPopup, setDailyRewardPopup] = useState<{ active: boolean; streak: number; reward: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const radioNodesRef = useRef<any[]>([]);
  const biteTimeoutRef = useRef<number | null>(null);

  // ... (Helper functions like playSound, spawnText, showToast would be here)
  const showToast = useCallback((msg: string, color: string, sub?: string) => {
    setToast({ msg, color, sub });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const spawnText = useCallback((text: string, color: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev: FloatingText[]) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev: FloatingText[]) => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  const playSound = useCallback((type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl' | 'splash') => {
    if (isMuted) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (ctx.state === 'closed') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      const rate = Math.min(2.0, 1.0 + (combo * 0.05));

      if (type === 'splash') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(200 * rate, now);
         osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.3);
         osc.start(now);
         osc.stop(now + 0.3);
      } else if (type === 'cast') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150 * rate, now); osc.frequency.linearRampToValueAtTime(600 * rate, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(440 * rate, now); osc.frequency.setValueAtTime(554 * rate, now + 0.1); osc.frequency.setValueAtTime(659 * rate, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4);
      } else if (type === 'fail') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'cash') {
        osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(1100, now + 0.05); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'lvl') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(800, now + 0.5); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 1); osc.start(now); osc.stop(now + 1);
      } else if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); osc.start(now); osc.stop(now + 0.05);
      }
    } catch (e) { }
  }, [isMuted, combo]);

  const castRod = () => {
      if (stats.rodHp <= 0) {
          showToast("Olta Kırık! Tamir et.", "text-red-400");
          return;
      }
      if (!stats.baitId) {
          showToast("Yem Yok!", "text-red-400");
          return;
      }
      setGameState(GameState.CASTING);
      playSound('cast');
      
      setTimeout(() => {
          setGameState(GameState.WAITING);
          // Bite logic
          const baseTime = 2000;
          const randomTime = Math.random() * 3000;
          const waitTime = baseTime + randomTime;
          
          biteTimeoutRef.current = window.setTimeout(() => {
              setGameState(GameState.BITE);
              playSound('splash');
              // Auto fail if not hooked in 3s
              biteTimeoutRef.current = window.setTimeout(() => {
                  setGameState(GameState.IDLE);
                  showToast("Balık Kaçtı...", "text-slate-400");
                  setCombo(0);
              }, 2000);
          }, waitTime);
      }, 500);
  };

  const hookFish = () => {
      if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
      
      const allFish = FISH_DB[stats.locId] || [];
      const fishList = allFish.filter(f => f.type === ItemType.FISH);
      if (fishList.length === 0) return;
      
      // Determine fish based on luck/bait
      let fish = fishList[Math.floor(Math.random() * fishList.length)];
      
      // Buff checks
      if (buffs.goldenHook) {
         const rareFish = fishList.filter(f => f.rarity >= 3);
         if (rareFish.length > 0) fish = rareFish[Math.floor(Math.random() * rareFish.length)];
         setBuffs(b => ({...b, goldenHook: false}));
      }

      setActiveFish(fish);
      setGameState(GameState.MINIGAME);
  };

  const reelIn = (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => {
      setGameState(GameState.IDLE);
      setCatchVisual(null);
      
      if (snapped) {
          setStats(s => ({ ...s, rodHp: Math.max(0, s.rodHp - 2) }));
          showToast("Misina Koptu!", "text-red-400");
          playSound('fail');
          setCombo(0);
          return;
      }

      if (!success) {
          showToast("Balık Kurtuldu...", "text-slate-400");
          setCombo(0);
          return;
      }

      const fish = fishOverride || activeFish;
      if (!fish) return;

      const weight = Number((Math.random() * 5 + 0.1).toFixed(2)); // Simplified weight
      const isShiny = Math.random() < 0.05;
      const isGolden = Math.random() < 0.01;
      
      const catchItem: CatchItem = {
          ...fish,
          id: Date.now().toString(),
          weight,
          shiny: isShiny,
          golden: isGolden,
          perfect,
          visual: fish.visual || { shape: 'fish', bodyColor: 'grey', finColor: 'grey', pattern: 'none' } as any
      };

      if (bag.length >= stats.bagLimit) {
          showToast("Çanta Dolu!", "text-red-400");
          return;
      }

      setBag(prev => [catchItem, ...prev]);
      
      // Stats Update
      setStats(prev => ({
          ...prev,
          xp: prev.xp + 10,
          money: prev.money + 5, // Instant small reward
          rodHp: Math.max(0, prev.rodHp - 0.1),
          baitId: prev.baitId // Consumable logic could be here
      }));

      playSound('success');
      setCombo(c => c + 1);
      
      if (isGolden || fish.rarity >= 5) {
          setCelebrationFish(catchItem);
          playSound('lvl');
      } else {
          setCatchVisual({
              emoji: fish.emoji,
              visual: fish.visual!,
              rarity: fish.rarity,
              id: Date.now(),
              shiny: isShiny,
              golden: isGolden
          });
          setTimeout(() => setCatchVisual(null), 2000);
      }

      // Add to pedia
      setPedia(prev => {
          const entry = prev[fish.name] || { count: 0, maxWeight: 0, shinyCaught: false, goldenCaught: false };
          return {
              ...prev,
              [fish.name]: {
                  count: entry.count + 1,
                  maxWeight: Math.max(entry.maxWeight, weight),
                  shinyCaught: entry.shinyCaught || isShiny,
                  goldenCaught: entry.goldenCaught || isGolden,
                  donated: entry.donated
              }
          };
      });
  };

  const sellItem = (id: string, fromAqua = false) => {
      const list = fromAqua ? aquarium : bag;
      const item = list.find(i => i.id === id);
      if (!item) return;

      const price = item.value; // Simplify
      setStats(s => ({ ...s, money: s.money + price }));
      
      if (fromAqua) setAquarium(prev => prev.filter(i => i.id !== id));
      else setBag(prev => prev.filter(i => i.id !== id));
      
      playSound('cash');
      spawnText(`+${price} TL`, "text-yellow-400");
  };

  const sellAll = () => {
      let total = 0;
      const toKeep: CatchItem[] = [];
      bag.forEach(item => {
          if (item.type === ItemType.FISH || item.type === ItemType.JUNK) {
              total += item.value;
          } else {
              toKeep.push(item);
          }
      });
      setStats(s => ({ ...s, money: s.money + total }));
      setBag(toKeep);
      if (total > 0) {
          playSound('cash');
          showToast(`Tümü Satıldı: ${total} TL`, "text-green-400");
      }
  };

  const recycleJunk = () => {
      const junk = bag.filter(i => i.type === ItemType.JUNK);
      if (junk.length === 0) { showToast("Çöp Yok", "text-slate-400"); return; }
      
      const count = junk.length;
      setBag(prev => prev.filter(i => i.type !== ItemType.JUNK));
      
      // Reward
      const baitReward = Math.floor(count / 2);
      if (baitReward > 0) {
           // Add worms
           // Simplified
           showToast(`Dönüşüm: +${baitReward} Yem`, "text-green-400");
      }
      setEcologyScore(s => Math.min(100, s + count));
  };

  const buyItem = (type: string, id: string | number) => {
      if (type === 'rod') {
          const rod = RODS.find(r => r.id === id);
          if (rod && stats.money >= rod.price) {
              setStats(s => ({ ...s, money: s.money - rod.price }));
              setOwnedRods(prev => [...prev, Number(id)]);
              playSound('cash');
          }
      }
      // Implement other types similarly
  };

  const useItem = (id: string) => {
      const item = bag.find(i => i.id === id);
      if (!item) return;
      if (item.type === ItemType.BUFF) {
          if (item.id.includes('energy')) {
              setBuffs(b => ({ ...b, xpBoostExpiry: Date.now() + 300000 }));
              showToast("Enerji İçeceği İçildi!", "text-purple-400");
          }
          setBag(prev => prev.filter(i => i.id !== id));
      }
  };
  
  const equipRod = (id: number) => setStats(s => ({...s, rodId: id}));
  const equipBobber = (id: string) => setStats(s => ({...s, bobberId: id}));
  const toggleDecor = (id: string) => {
      if (activeDecor.includes(id)) setActiveDecor(prev => prev.filter(d => d !== id));
      else setActiveDecor(prev => [...prev, id]);
  };
  const repairRod = () => {
      const cost = 100;
      if (stats.money >= cost) {
          setStats(s => ({ ...s, money: s.money - cost, rodHp: RODS[s.rodId].maxHp }));
          playSound('success');
      }
  };
  const travel = (id: number) => setStats(s => ({ ...s, locId: id }));
  
  const claimQuest = (index: number) => {
      const q = quests[index];
      if (q && q.current >= q.target && !q.claimed) {
          setStats(s => ({ ...s, money: s.money + q.reward }));
          const newQuests = [...quests];
          newQuests[index].claimed = true;
          setQuests(newQuests);
          playSound('cash');
      }
  };

  const moveToAqua = (id: string) => {
      const item = bag.find(i => i.id === id);
      if (!item) return;
      if (aquarium.length >= stats.aquaLimit) { showToast("Akvaryum Dolu", "text-red-400"); return; }
      setBag(prev => prev.filter(i => i.id !== id));
      setAquarium(prev => [...prev, item]);
      showToast("Akvaryuma Eklendi", "text-blue-400");
  };

  const cleanAquarium = () => {
      if (stats.money >= 250) {
          setStats(s => ({ ...s, money: s.money - 250 }));
          setFilterExpiry(Date.now() + 3600000);
          showToast("Akvaryum Temizlendi", "text-cyan-400");
      }
  };

  const upgradeSkill = (id: string) => {
      // implementation
  };
  const resetGame = () => {};
  const startNewGame = () => {
      setStats(INITIAL_STATS);
      setBag([]);
      setAquarium([]);
      // ... reset others
  };
  const closeCelebration = () => setCelebrationFish(null);
  const startDiving = () => setGameState(GameState.DIVING);
  const endDiving = (score: number) => {
      setGameState(GameState.IDLE);
      setStats(s => ({ ...s, money: s.money + score }));
      showToast(`Dalış Bitti: +${score} TL`, "text-yellow-400");
  };
  const playSlotMachine = (bet: number) => {
      // Simple logic
      setStats(s => ({ ...s, money: s.money - bet }));
      const win = Math.random() < 0.3;
      if (win) {
          const reward = bet * 2;
          setStats(s => ({ ...s, money: s.money + reward }));
          return { result: ['🍒','🍒','🍒'], reward, winType: 'small' as const };
      }
      return { result: ['🍒','🍋','🍇'], reward: 0, winType: 'none' as const };
  };
  const claimDailyReward = () => {
      if (dailyRewardPopup) {
          setStats(s => ({ ...s, money: s.money + dailyRewardPopup.reward }));
          setDailyRewardPopup(null);
      }
  };
  const upgradeWormFarm = () => setStats(s => ({...s, wormFarmLevel: s.wormFarmLevel + 1}));
  const upgradeAutoNet = () => setAutoNetLevel(l => l + 1);
  const toggleSetting = (key: 'sortMode' | 'bulkSellSafe') => {
      setSettings(s => ({ ...s, [key]: key === 'sortMode' ? (s.sortMode === 'recent' ? 'value' : 'recent') : !s.bulkSellSafe }));
  };
  const collectOfflineEarnings = () => {
      if (offlineEarningsModal) {
          setStats(s => ({ ...s, money: s.money + offlineEarningsModal }));
          setOfflineEarningsModal(null);
      }
  };
  const buyPet = (id: string) => {
      // impl
  };
  const feedPet = (id: string) => {
      // impl
  };
  const doPrestige = () => {};
  const buyPrestigeUpgrade = (id: string) => {};
  const calculatePrestigePearls = () => 0;
  const donateFish = (id: string) => {
      const item = bag.find(i => i.id === id);
      if (!item) return;
      setBag(prev => prev.filter(i => i.id !== id));
      setPedia(prev => ({ ...prev, [item.name]: { ...prev[item.name], donated: true } }));
      showToast("Müzeye Bağışlandı!", "text-purple-400");
  };
  const craftItem = (recipeId: string) => {};
  const buyMerchantItem = (idx: number) => {};
  
  // Effects
  useEffect(() => {
    // Event Trigger Loop (Check every minute)
    const eventLoop = setInterval(() => {
        if (!activeEvent && Math.random() < 0.15) { // 15% chance every minute
            const eventTypes: GameEvent[] = [
                { id: 'frenzy', name: '🌊 Balık Sürüsü', description: 'Balıklar çok hızlı vuruyor!', duration: 60000, startTime: Date.now(), color: 'text-blue-400' },
                { id: 'gold_rush', name: '💰 Altın Akını', description: 'Satış fiyatları x2!', duration: 60000, startTime: Date.now(), color: 'text-yellow-400' },
                { id: 'giant_fish', name: '🐋 Devlerin Göçü', description: 'Balıklar %50 daha ağır!', duration: 90000, startTime: Date.now(), color: 'text-purple-400' },
                { id: 'calm_waters', name: '✨ Sakin Sular', description: 'Balık tutmak çok kolaylaştı!', duration: 60000, startTime: Date.now(), color: 'text-cyan-400' }
            ];
            const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            setActiveEvent(randomEvent);
            playSound('lvl');
            showToast(`OLAY BAŞLADI: ${randomEvent.name}`, "text-white", randomEvent.description);
        }
    }, 60000);

    // Event Expiry Loop (Check every second)
    const expiryLoop = setInterval(() => {
        if (activeEvent) {
            if (Date.now() > activeEvent.startTime + activeEvent.duration) {
                setActiveEvent(null);
                showToast("Etkinlik Sona Erdi", "text-slate-400");
            }
        }
    }, 1000);

    return () => {
        clearInterval(eventLoop);
        clearInterval(expiryLoop);
    };
  }, [activeEvent, playSound, showToast]);

  const buyIngredient = (type: 'vegetables' | 'meze' | 'raki' | 'oil', amount: number, cost: number) => {
      if (stats.money >= cost) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - cost }));
          setRestaurant((prev: RestaurantState) => ({
              ...prev,
              ingredients: {
                  ...prev.ingredients,
                  [type]: prev.ingredients[type] + amount
              }
          }));
          playSound('cash');
          showToast(`Satın alındı!`, "text-green-400");
      } else {
          showToast("Yetersiz Bakiye", "text-red-400");
          playSound('fail');
      }
  };

  const unlockRestaurant = () => {
      const COST = 30000;
      if (stats.level < 5) {
          showToast("Seviye 5 Gerekli!", "text-red-400");
          return;
      }
      if (stats.money >= COST) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - COST }));
          setRestaurant((prev: RestaurantState) => ({ ...prev, isUnlocked: true }));
          playSound('success');
          showToast("Restoran Satın Alındı!", "text-cyan-400", "İşletmeye Başla!");
      } else {
          showToast(`Yetersiz Bakiye (${COST.toLocaleString()} TL)`, "text-red-400");
          playSound('fail');
      }
  };

  useEffect(() => {
      // Customer Spawner (Only if unlocked)
      if (!isRestaurantOpen || !restaurant.isUnlocked) return;
      
      const spawnCustomer = () => {
          if (activeCustomers.length >= 4) return;
          
          const names = ["Hüseyin Abi", "Müjgan Abla", "Balıkçı Nuri", "Turist John", "Gurme Vedat", "Mahalleli Ayşe", "Dayı", "Kaptan Jack"];
          const orders = ['grilled', 'sandwich', 'raki_table'] as const;
          
          const isVip = Math.random() < (0.05 + (restaurant.reputation / 1000));
          const diff = Math.min(5, 1 + Math.floor(restaurant.reputation / 100));
          const orderType = Math.random() < 0.2 ? 'raki_table' : Math.random() < 0.6 ? 'grilled' : 'sandwich';
          
          const customer: Customer & { isVip?: boolean } = {
              id: Date.now() + Math.random(),
              name: isVip ? `⭐ GURME ${names[Math.floor(Math.random() * names.length)]}` : names[Math.floor(Math.random() * names.length)],
              order: orderType,
              fishReq: {
                  rarity: orderType === 'raki_table' ? 3 : orderType === 'grilled' ? 2 : 1,
                  minWeight: 1 + Math.random() * diff
              },
              patience: 100,
              maxPatience: 100,
              reward: 0,
              isVip: isVip
          };
          
          setActiveCustomers((prev: Customer[]) => [...prev, customer]);
          if (isVip) {
              playSound('success');
              showToast("GURME GELDİ!", "text-yellow-300", "Özel Servis Yap!");
          } else {
              playSound('click'); 
          }
      };

      const spawnRate = Math.max(1000, 3000 - (restaurant.reputation * 5));
      
      const interval = setInterval(() => {
          if (Math.random() < 0.4) spawnCustomer();
          setActiveCustomers((prev: Customer[]) => prev.map((c: Customer) => ({
              ...c, 
              patience: c.patience - (c['isVip'] ? 4 : 2)
          })).filter((c: Customer) => {
              if (c.patience <= 0) {
                  setRestaurant((r: RestaurantState) => ({...r, reputation: Math.max(0, r.reputation - 10)})); // Bigger penalty
                  showToast("Müşteri Sinirlendi!", "text-red-400");
                  return false; 
              }
              return true;
          }));

      }, spawnRate);

      return () => clearInterval(interval);
  }, [isRestaurantOpen, restaurant.isUnlocked, activeCustomers.length, restaurant.reputation, playSound, showToast]);

  const serveCustomer = (customerId: number, fishId: string) => {
      const customer = activeCustomers.find(c => c.id === customerId) as (Customer & { isVip?: boolean }) | undefined;
      const fish = bag.find(f => f.id === fishId);
      if (!customer || !fish) return;

      const ings = restaurant.ingredients;
      let costVeg = 0, costOil = 0, costRaki = 0, costMeze = 0;
      let multiplier = 1;

      if (customer.order === 'sandwich') { costVeg = 1; multiplier = 2.5; }
      if (customer.order === 'grilled') { costOil = 1; costVeg = 1; multiplier = 3.5; }
      if (customer.order === 'raki_table') { costRaki = 1; costMeze = 2; costVeg = 2; costOil = 1; multiplier = 8.0; }

      if (ings.vegetables < costVeg || ings.oil < costOil || ings.raki < costRaki || ings.meze < costMeze) {
          showToast("Malzemeler Eksik!", "text-red-400");
          return;
      }

      if (fish.rarity < customer.fishReq.rarity || fish.weight < customer.fishReq.minWeight) {
          showToast("Müşteri bu balığı beğenmedi!", "text-orange-400");
          return;
      }

      setBag((prev: CatchItem[]) => prev.filter(f => f.id !== fishId));
      
      let reputationGain = customer.isVip ? 10 : 2;
      let newReputation = restaurant.reputation + reputationGain;
      let newLevel = restaurant.level;
      if (newReputation >= newLevel * 100) {
          newLevel++;
          playSound('lvl');
          showToast("Restoran Seviye Atladı!", "text-yellow-400");
      }
      
      setRestaurant((prev: RestaurantState) => ({
          ...prev,
          ingredients: {
              vegetables: prev.ingredients.vegetables - costVeg,
              oil: prev.ingredients.oil - costOil,
              raki: prev.ingredients.raki - costRaki,
              meze: prev.ingredients.meze - costMeze,
          },
          reputation: newReputation,
          level: 1 + Math.floor(newReputation / 100)
      }));
      setActiveCustomers((prev: Customer[]) => prev.filter(c => c.id !== customerId));

      let reward = Math.floor(fish.value * multiplier);
      if (customer.isVip) reward *= 3; 

      let tip = 0;
      if (customer.patience > 80) tip += Math.floor(reward * 0.3);
      else if (customer.patience > 50) tip += Math.floor(reward * 0.15);
      if (restaurant.reputation > 50) tip += Math.floor(restaurant.reputation * 0.5);
      
      const totalReward = reward + tip;

      setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + totalReward, xp: prev.xp + (customer.isVip ? 200 : 50) }));
      playSound('cash');
      showToast("Sipariş Tamamlandı!", "text-green-400", `+${reward} TL ${tip > 0 ? `(+${tip} Bahşiş)` : ''}`);
      spawnText(`+${totalReward} TL`, "text-yellow-400", 50, 50);
  };

  const rejectCustomer = (customerId: number) => {
      setActiveCustomers((prev: Customer[]) => prev.filter(c => c.id !== customerId));
      setRestaurant((prev: RestaurantState) => ({ ...prev, reputation: Math.max(0, prev.reputation - 2) }));
  };

  useEffect(() => {
    radioNodesRef.current.forEach(node => {
        try { node.stop(); } catch {}
        try { node.disconnect(); } catch {}
    });
    radioNodesRef.current = [];

    if (radioStation === 'off' || isMuted) return;

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
        const ctx = audioCtxRef.current;
        if (ctx?.state === 'suspended') ctx.resume();

        const masterGain = ctx?.createGain();
        if (masterGain && ctx) {
            masterGain.gain.value = 0.05; 
            masterGain.connect(ctx.destination);

            if (radioStation === 'nature') {
                 const bufferSize = ctx.sampleRate * 2;
                 const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                 const data = buffer.getChannelData(0);
                 let lastOut = 0;
                 for (let i = 0; i < bufferSize; i++) {
                     const white = Math.random() * 2 - 1;
                     data[i] = (lastOut + (0.02 * white)) / 1.02;
                     lastOut = data[i];
                     data[i] *= 3.5; 
                 }
                 const noise = ctx.createBufferSource();
                 noise.buffer = buffer;
                 noise.loop = true;
                 const filter = ctx.createBiquadFilter();
                 filter.type = 'lowpass';
                 filter.frequency.value = 400;
                 const lfo = ctx.createOscillator();
                 lfo.type = 'sine';
                 lfo.frequency.value = 0.1;
                 const lfoGain = ctx.createGain();
                 lfoGain.gain.value = 300;
                 lfo.connect(lfoGain);
                 lfoGain.connect(filter.frequency);
                 noise.connect(filter);
                 filter.connect(masterGain);
                 noise.start();
                 lfo.start();
                 radioNodesRef.current.push(noise, lfo);
            } else if (radioStation === 'lofi') {
                 const chords = [261.63, 311.13, 392.00, 466.16]; 
                 chords.forEach((freq, i) => {
                     const osc = ctx.createOscillator();
                     osc.type = 'triangle';
                     osc.frequency.value = freq;
                     const gain = ctx.createGain();
                     gain.gain.value = 0.1 / chords.length;
                     const lfo = ctx.createOscillator();
                     lfo.frequency.value = 0.5 + Math.random();
                     const lfoGain = ctx.createGain();
                     lfoGain.gain.value = 2; 
                     lfo.connect(lfoGain);
                     lfoGain.connect(osc.frequency);
                     osc.connect(gain);
                     gain.connect(masterGain);
                     osc.start();
                     lfo.start();
                     radioNodesRef.current.push(osc, lfo);
                 });
            }
        }
    } catch (e) { console.error("Radio error", e); }
  }, [radioStation, isMuted]);

  const cycleRadio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
      }
      setRadioStation((prev: RadioStation) => {
          if (prev === 'off') return 'nature';
          if (prev === 'nature') return 'lofi';
          return 'off';
      });
      const next = radioStation === 'off' ? 'nature' : radioStation === 'nature' ? 'lofi' : 'off';
      const msg = next === 'nature' ? "Radyo: Doğa Sesleri" : next === 'lofi' ? "Radyo: Lo-Fi Modu" : "Radyo: Kapalı";
      showToast(msg, "text-white");
  };

  const getPrestigeBonus = useCallback((type: 'money' | 'xp' | 'power' | 'luck' | 'auto' | 'discount') => {
      let multiplier = 0;
      PRESTIGE_UPGRADES.filter(u => u.type === type).forEach(u => {
          const level = prestigeUpgrades[u.id] || 0;
          multiplier += level * u.effectPerLevel;
      });
      return multiplier;
  }, [prestigeUpgrades]);

  useEffect(() => {
    const updateMarket = () => {
        const prices: Record<string, number> = {};
        const allFish = (Object.values(FISH_DB) as FishBase[][]).flat();
        allFish.forEach(f => {
            if (f.type === ItemType.FISH) {
                const mult = 0.75 + Math.random() * 0.6; 
                prices[f.name] = Number(mult.toFixed(2));
            }
        });
        setMarketMultipliers(prices);
    };
    updateMarket(); 
    const timer = setInterval(() => {
        updateMarket();
        showToast("📉 Borsa Güncellendi! Fiyatlar değişti.", "text-blue-300");
    }, 60000); 
    return () => clearInterval(timer);
  }, [showToast]);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!mysteryMerchant && Math.random() < 0.1) {
              const items: { type: 'bait'|'buff'|'rod', id: string|number, price: number, name: string }[] = [
                  { type: 'bait', id: 'legendary_bait', price: 25000, name: 'Efsanevi Yem (İndirimli)' },
                  { type: 'buff', id: 'xp_elixir', price: 5000, name: 'XP İksiri (5000 XP)' }, 
                  { type: 'rod', id: 4, price: 2000, name: 'Göl Kamışı (Fırsat)' } 
              ];
              setMysteryMerchant({
                  active: true,
                  expiry: Date.now() + 60000, 
                  items: items
              });
              showToast("Gizemli Tüccar Belirdi!", "text-fuchsia-400");
              playSound('success');
          }
      }, 60000);
      return () => clearInterval(interval);
  }, [mysteryMerchant, playSound, showToast]);

  useEffect(() => {
      if (mysteryMerchant && Date.now() > mysteryMerchant.expiry) {
          setMysteryMerchant(null);
          showToast("Gizemli Tüccar Ayrıldı", "text-slate-400");
      }
      const checkExpiry = setInterval(() => {
          if (mysteryMerchant && Date.now() > mysteryMerchant.expiry) {
              setMysteryMerchant(null);
              showToast("Gizemli Tüccar Ayrıldı", "text-slate-400");
          }
      }, 1000);
      return () => clearInterval(checkExpiry);
  }, [mysteryMerchant, showToast]);

  useEffect(() => {
      const timer = setInterval(() => {
          setNewsTicker(NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)]);
      }, 30000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          setStats((prev: PlayerStats) => {
              if (prev.bankBalance > 0) {
                  const interest = Math.floor(prev.bankBalance * 0.01);
                  return { ...prev, bankBalance: prev.bankBalance + interest };
              }
              return prev;
          });
          
          if (autoNetLevel > 0) {
              const income = autoNetLevel * 10;
              const charmBoost = ownedCharms.includes('auto_gear') ? 1.2 : 1;
              const prestigeBoost = 1 + getPrestigeBonus('auto');
              setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + Math.floor(income * charmBoost * prestigeBoost) }));
          }

          setOwnedPets((pets: OwnedPet[]) => pets.map(p => {
             if (p.hunger > 0) return { ...p, hunger: Math.max(0, p.hunger - 5) }; 
             return p;
          }));

          if (stats.wormFarmLevel > 0) {
              setBag((currentBag: CatchItem[]) => {
                  if (currentBag.length < stats.bagLimit) {
                      const newWorm: CatchItem = {
                          name: 'Solucan',
                          type: ItemType.BAIT,
                          value: 5,
                          rarity: 0,
                          emoji: '🪱',
                          weight: 0.1,
                          id: Date.now().toString() + Math.random(),
                          visual: { shape: 'long', bodyColor: '#fca5a5', finColor: '#ef4444', pattern: 'none' }
                      };
                      const amount = stats.wormFarmLevel;
                      const space = stats.bagLimit - currentBag.length;
                      const toAdd = Math.min(amount, space);
                      if (toAdd > 0) {
                          showToast(`Solucan Çiftliği: +${toAdd} Yem`, "text-amber-400");
                          const worms = Array(toAdd).fill(null).map((_, i) => ({...newWorm, id: newWorm.id + i}));
                          return [...currentBag, ...worms];
                      }
                  }
                  return currentBag;
              });
          }

      }, 60000);
      return () => clearInterval(timer);
  }, [autoNetLevel, ownedCharms, prestigeUpgrades, getPrestigeBonus, stats.wormFarmLevel, stats.bagLimit, showToast]);

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 21) setTimeOfDay('sunset');
      else setTimeOfDay('night');
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          if (!visitorTip && aquarium.length > 0 && Math.random() < 0.1) {
              setVisitorTip({ active: true, amount: Math.floor(Math.random() * 50) + 10 });
          }
      }, 30000);
      return () => clearInterval(timer);
  }, [visitorTip, aquarium.length]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
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

  const generateQuests = useCallback((locId: number) => {
    const mult = locId + 1;
    const newQuests: Quest[] = [
      { id: Date.now(), desc: "3 Balık Tut", target: 3, current: 0, reward: 100 * mult, claimed: false, type: 'count' },
      { id: Date.now()+1, desc: "Gelir Elde Et", target: 200 * mult, current: 0, reward: 150 * mult, claimed: false, type: 'money' },
      { id: Date.now()+2, desc: "1 Nadir+ Balık", target: 1, current: 0, reward: 250 * mult, claimed: false, type: 'rare' }
    ];
    setQuests(newQuests);
    setQuestCooldown(0);
  }, []);

  const closeTournamentResult = useCallback(() => {
    setTournament((prev: TournamentState) => ({ ...prev, finished: false }));
  }, []);

  useEffect(() => {
     const allFish = (Object.values(FISH_DB) as FishBase[][]).flat().filter(f => f.type === ItemType.FISH);
     if (allFish.length > 0) {
         const trendFish = allFish[Math.floor(Math.random() * allFish.length)];
         setMarketTrend({ fishName: trendFish.name, multiplier: 1.5 });
     }
     setActiveDiscount(Math.random() < 0.2);
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!supplyCrate && gameState === GameState.IDLE && Math.random() < 0.15) {
              setSupplyCrate({
                  active: true,
                  x: 10 + Math.random() * 80,
                  y: 50 + Math.random() * 20
              });
              setTimeout(() => setSupplyCrate(null), 10000);
          }
      }, 45000);
      return () => clearInterval(interval);
  }, [supplyCrate, gameState]);

  const collectCrate = () => {
      if (!supplyCrate) return;
      playSound('success');
      setSupplyCrate(null);
      const rand = Math.random();
      if (rand < 0.4) {
          const reward = 50 + stats.level * 20;
          setStats((s: PlayerStats) => ({ ...s, money: s.money + reward }));
          spawnText(`+${reward} TL`, "text-yellow-400", supplyCrate.x, supplyCrate.y);
      } else if (rand < 0.7) {
          const bait = BAITS[Math.floor(Math.random() * 3)];
          setStats((s: PlayerStats) => ({ ...s, baitId: bait.id }));
          showToast(`Kasa: ${bait.name}`, "text-emerald-400");
      } else {
          showToast("Kasa Boş Çıktı :(", "text-slate-400");
      }
  };

  const collectVisitorTip = () => {
      if (!visitorTip || !visitorTip.active) return;
      setStats((prev: PlayerStats) => ({ ...prev, money: prev.money + visitorTip.amount }));
      setVisitorTip(null);
      spawnText(`+${visitorTip.amount} TL`, "text-yellow-300", 50, 50);
      playSound('cash');
  };

  const rerollFortune = () => {
      if (stats.money >= 1000) {
          setStats((prev: PlayerStats) => ({ ...prev, money: prev.money - 1000 }));
          setDailyFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
          showToast("Fal Yenilendi", "text-purple-400");
          playSound('success');
      } else {
          showToast("Yetersiz Bakiye (1000 TL)", "text-red-400");
      }
  };

  const cookFish = (id: string) => {
      const fish = bag.find(f => f.id === id);
      if (!fish) return;
      
      const hpRestore = Math.ceil(fish.weight * 2);
      setStats((prev: PlayerStats) => ({ ...prev, rodHp: Math.min(RODS[prev.rodId].maxHp, prev.rodHp + hpRestore) }));
      setBag((prev: CatchItem[]) => prev.filter(f => f.id !== id));
      spawnText(`+${hpRestore} HP`, "text-red-400");
      playSound('success');
  };

  const bankDeposit = (amount: number) => {
      if (stats.money >= amount && amount > 0) {
          setStats(s => ({ ...s, money: s.money - amount, bankBalance: s.bankBalance + amount }));
          showToast(`${amount} TL Yatırıldı`, "text-green-400");
          playSound('cash');
      }
  };

  const bankWithdraw = (amount: number) => {
      if (stats.bankBalance >= amount && amount > 0) {
          setStats(s => ({ ...s, bankBalance: s.bankBalance - amount, money: s.money + amount }));
          showToast(`${amount} TL Çekildi`, "text-green-400");
          playSound('cash');
      }
  };

  const value = {
      stats, bag, aquarium, gameState, activeFish, weather, quests, questCooldown, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, toast, floatingTexts, celebrationFish, catchVisual, isMuted, lifetimeStats, dailyFortune, timeOfDay,
      combo, tournament, bounty, closeTournamentResult,
      filterExpiry, cleanAquarium, marketTrend, marketMultipliers, rodMastery, supplyCrate, collectCrate, activeDiscount, mysteryMerchant,
      ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
      autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, upgradeWormFarm, spinWheel: () => {}, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
      ownedPets, buyPet, feedPet,
      prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
      donateFish, craftItem, buyMerchantItem,
      castRod, reelIn, sellItem, useItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, claimQuest, moveToAqua, upgradeSkill, resetGame, startNewGame, closeCelebration, playSound, toggleMute, getRank, generateQuests, startDiving, endDiving,
      radioStation, cycleRadio, hookFish, playSlotMachine,
      dailyRewardPopup, claimDailyReward,
      restaurant, activeCustomers, buyIngredient, serveCustomer, rejectCustomer, isRestaurantOpen, setIsRestaurantOpen, unlockRestaurant,
      activeEvent
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
