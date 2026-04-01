import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  PlayerStats, CatchItem, Quest, GameState, WeatherType, PediaEntry,
  FishBase, ItemType, FloatingText, CatchVisual, LifetimeStats, TournamentState,
  Bounty, MarketTrend, OwnedPet, MysteryMerchant, RadioStation, RestaurantState, Customer, GameEvent,
  DuelState, Rival, SavedGame, Rod, Bait, Location as AppLocation, Charm
} from './types';
import { RODS, FISH_DB, BAITS, BOBBERS, CHARMS, ACHIEVEMENTS, PRESTIGE_UPGRADES, CRAFTING_RECIPES, RIVALS, WHEEL_REWARDS, LOCATIONS, PETS, LEAGUES } from './constants';

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
  spinWheel: () => number;
  toggleSetting: (key: 'sortMode' | 'bulkSellSafe') => void;
  collectOfflineEarnings: () => void;
  offlineEarningsModal: { total: number; net: number; tourism: number } | null;

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

  duel: DuelState;
  startDuel: (rivalId: string) => void;
  surrenderDuel: () => void;

  startTreasureHunt: () => void;
  digTreasure: (index: number) => { found: 'gold' | 'trap' | 'nothing' | 'pearl', amount: number };
  museumStars: number;
  totalVisitors: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATS: PlayerStats = {
  money: 0,
  xp: 0,
  level: 1,
  rodId: 0,
  rodHp: 10,
  locId: 0,
  bagLimit: 10,
  aquaLimit: 5,
  baitId: null,
  bobberId: 'basic',
  bankBalance: 0,
  pearls: 0,
  prestigeLevel: 0,
  wormFarmLevel: 0,
  dailyStreak: 0,
  lastRewardTime: 0,
  leaguePoints: 0
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

const INITIAL_RESTAURANT: RestaurantState = {
  isUnlocked: false,
  level: 1,
  ingredients: { vegetables: 0, meze: 0, raki: 0, oil: 0 },
  reputation: 0
};

const FORTUNES = [
  "Bugün şansın yaver gidecek!",
  "Suların derinliklerinde bir sır seni bekliyor.",
  "Rüzgar doğudan esiyor, balıklar hareketli.",
  "Sabreden derviş muradına ermiş.",
  "Büyük bir balık kaçabilir, dikkatli ol."
];

const NEWS_HEADLINES = [
  "HABER: Bugün Levrek fiyatları tavan yaptı! (%50 Bonus)",
  "TURİZM: Akvaryumuna nadir balıklar koy, uyurken para kazan!",
  "HAVA DURUMU: Yarın fırtına bekleniyor, hazine şansı artacak.",
  "DÜELLO: Usta Nuri yeni rakiplerini bekliyor...",
  "İSTİHBARAT: Tropikal bölgelerde efsanevi türler görüldü.",
  "EKONOMİ: Olta tamir masraflarında %20 indirim haftası!",
  "GİZEM: Gece yarısı çıkan parlayan balıklar daha değerli.",
  "DİKKAT: Deniz kirliliği arttı, daha çok çöp çıkabilir."
];

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

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
  const [isMuted, setIsMuted] = useState(true);
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
  const [offlineEarningsModal, setOfflineEarningsModal] = useState<{ total: number; net: number; tourism: number } | null>(null);
  
  const [museumStars, setMuseumStars] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);

  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([]);

  const [prestigeUpgrades, setPrestigeUpgrades] = useState<Record<string, number>>({});
  const [mysteryMerchant, setMysteryMerchant] = useState<MysteryMerchant | null>(null);

  const [restaurant, setRestaurant] = useState<RestaurantState>(INITIAL_RESTAURANT);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  const [duel, setDuel] = useState<DuelState>({
    active: false, rivalId: null, startTime: 0, duration: 60, playerScore: 0, rivalScore: 0, finished: false, result: null
  });

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

  const [isLoading, setIsLoading] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const biteTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hasan_fisherman_save_v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
        if (data.lifetimeStats) setLifetimeStats(data.lifetimeStats);
        if (data.bag) setBag(data.bag);
        if (data.aquarium) setAquarium(data.aquarium);
        if (data.skills) setSkills(data.skills);
        if (data.unlockedLocs) setUnlockedLocs(data.unlockedLocs);
        if (data.ownedRods) setOwnedRods(data.ownedRods);
        if (data.ownedBobbers) setOwnedBobbers(data.ownedBobbers);
        if (data.ownedDecor) setOwnedDecor(data.ownedDecor);
        if (data.activeDecor) setActiveDecor(data.activeDecor);
        if (data.achievements) setAchievements(data.achievements);
        if (data.pedia) setPedia(data.pedia);
        if (data.autoNetLevel) setAutoNetLevel(data.autoNetLevel);
        if (data.ownedCharms) setOwnedCharms(data.ownedCharms);
        if (data.mapParts) setMapParts(data.mapParts);
        if (data.ownedPets) setOwnedPets(data.ownedPets);
        if (data.prestigeUpgrades) setPrestigeUpgrades(data.prestigeUpgrades);
        if (data.restaurant) setRestaurant(data.restaurant);
        if (data.isRestaurantOpen !== undefined) setIsRestaurantOpen(data.isRestaurantOpen);
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        if (data.museumStars) setMuseumStars(data.museumStars);
        if (data.totalVisitors) setTotalVisitors(data.totalVisitors);
      } catch (e) { console.error(e); }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const data = { stats, lifetimeStats, bag, aquarium, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, autoNetLevel, ownedCharms, mapParts, ownedPets, prestigeUpgrades, restaurant, isRestaurantOpen, settings, museumStars, totalVisitors, lastLogin: Date.now() };
    localStorage.setItem('hasan_fisherman_save_v2', JSON.stringify(data));
  }, [stats, lifetimeStats, bag, aquarium, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, autoNetLevel, ownedCharms, mapParts, ownedPets, prestigeUpgrades, restaurant, isRestaurantOpen, settings, museumStars, totalVisitors, isLoading]);

  const [treasureGrid, setTreasureGrid] = useState<('gold' | 'trap' | 'nothing' | 'pearl')[]>([]);

  const showToast = useCallback((msg: string, color: string, sub?: string) => {
    setToast({ msg, color, sub });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const spawnText = useCallback((text: string, color: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1500);
  }, []);

  const playSound = useCallback((type: 'click' | 'cast' | 'success' | 'fail' | 'cash' | 'lvl' | 'splash') => {
    if (isMuted) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === 'splash') { osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); }
      else if (type === 'cast') { osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); }
      else if (type === 'success') { osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(554, now + 0.1); osc.frequency.setValueAtTime(659, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); }
      else if (type === 'fail') { osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); }
      else if (type === 'cash') { osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(1100, now + 0.05); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); }
      else if (type === 'lvl') { osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(800, now + 0.5); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 1); }
      else if (type === 'click') { osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); }
      osc.start(now); osc.stop(now + 0.4);
    } catch (e) {}
  }, [isMuted]);

  const castRod = () => {
    if (stats.rodHp <= 0) { showToast("Olta Kırık!", "text-red-400"); return; }
    setGameState(GameState.CASTING);
    playSound('cast');
    setTimeout(() => {
      setGameState(GameState.WAITING);
      biteTimeoutRef.current = window.setTimeout(() => {
        setGameState(GameState.BITE);
        playSound('splash');
      }, 2000 + Math.random() * 3000);
    }, 500);
  };

  const hookFish = () => {
    if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
    const allFish = FISH_DB[stats.locId] || [];
    
    // Deeper regions have higher chance for boss/big fish
    const luckBonus = (skills.luck || 0) * 0.05;
    const fish = allFish[Math.floor(Math.random() * allFish.length)];
    
    // Boss Chance logic (Higher in deep sea: locId > 20)
    const bossChance = stats.locId > 20 ? 0.15 : 0.02;
    const isBossTrial = Math.random() < (bossChance + luckBonus);
    const activeFishData = isBossTrial && fish.isBoss ? {...fish, isBoss: true} : {...fish, isBoss: false};
    
    setActiveFish(activeFishData);
    setGameState(GameState.MINIGAME);
  };

  // Passive Income Logic (Tick every 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (aquarium.length > 0) {
        const tourismIncome = Math.floor(aquarium.reduce((acc, f) => acc + (f.value * 0.01), 0));
        if (tourismIncome > 0) {
          setStats(s => ({ ...s, money: s.money + tourismIncome }));
          spawnText(`+${tourismIncome} TL (Akvaryum)`, "text-cyan-400", 85, 20);
        }
      }

      // Random Market Trend change
      if (Math.random() < 0.1) {
        const allFish = Object.values(FISH_DB).flat().filter(f => f.type === ItemType.FISH);
        const randomFish = allFish[Math.floor(Math.random() * allFish.length)];
        setMarketTrend({ fishName: randomFish.name, multiplier: 1.5 });
        setNewsTicker(`PİYASA: ${randomFish.name} fiyatları arttı! (x1.5)`);
      }

      // Time cycle
      const hour = new Date().getHours();
      let mode: 'day' | 'sunset' | 'night' = 'day';
      if (hour >= 18 && hour < 21) mode = 'sunset';
      else if (hour >= 21 || hour < 6) mode = 'night';
      setTimeOfDay(mode);

    }, 10000);
    return () => clearInterval(timer);
  }, [aquarium, spawnText]);

  const reelIn = (success: boolean, snapped: boolean, perfect: boolean, fishOverride?: FishBase) => {
    if (snapped) {
      setGameState(GameState.SNAPPED);
      setStats(s => ({ ...s, rodHp: Math.max(0, s.rodHp - 1) }));
      playSound('fail');
      showToast("MİSİNA KOPTU!", "text-red-500", "Olta hasar aldı ve balık kaçtı.");
      setTimeout(() => setGameState(GameState.IDLE), 2000);
      return;
    }
    
    setGameState(GameState.IDLE);
    if (!success) return;
    
    const fish = fishOverride || activeFish;
    if (!fish) return;
    
    const weight = Number((Math.random() * 2 + 0.5 + (perfect ? 0.5 : 0)).toFixed(2));
    const catchItem: CatchItem = { 
        ...fish, 
        id: Date.now().toString(), 
        weight, 
        shiny: Math.random() < 0.05, 
        golden: Math.random() < 0.01, 
        perfect, 
        crown: perfect ? 'gold' : 'bronze', 
        visual: fish.visual || { shape: 'carp', bodyColor: '#888', finColor: '#666', pattern: 'none' } 
    };
    
    setBag(prev => [catchItem, ...prev]);
    setStats(s => ({ ...s, money: s.money + fish.value, xp: s.xp + (fish.rarity * 20) }));
    playSound('success');
    
    if (catchItem.shiny || catchItem.golden || fish.isBoss) {
        setCelebrationFish(catchItem);
    }
  };

  const sellItem = (id: string, fromAqua = false) => {
    const list = fromAqua ? aquarium : bag;
    const item = list.find(i => i.id === id);
    if (!item) return;
    setStats(s => ({ ...s, money: s.money + item.value }));
    if (fromAqua) setAquarium(prev => prev.filter(i => i.id !== id));
    else setBag(prev => prev.filter(i => i.id !== id));
    playSound('cash');
  };

  const useItem = (id: string) => {
    const item = bag.find(i => i.id === id);
    if (!item) return;
    setBag(prev => prev.filter(i => i.id !== id));
    showToast(`${item.name} kullanıldı.`, "text-blue-400");
  };

  const sellAll = () => {
    let total = 0;
    bag.forEach(i => { total += i.value; });
    setStats(s => ({ ...s, money: s.money + total }));
    setBag([]);
    playSound('cash');
    showToast(`Hepsini sattın: ${total} TL`, "text-green-400");
  };

  const recycleJunk = () => {
    const junkCount = bag.filter(i => i.type === ItemType.JUNK).length;
    if (junkCount === 0) return;
    setBag(prev => prev.filter(i => i.type !== ItemType.JUNK));
    setEcologyScore(s => s + junkCount);
    showToast(`${junkCount} çöp geri dönüştürüldü!`, "text-cyan-400");
  };

  const buyItem = (type: any, id: any) => {
    // Basic logic for buying rods/locations
    if (type === 'rod') {
      const rod = RODS.find(r => r.id === id);
      if (rod && stats.money >= rod.price) {
        setStats(s => ({ ...s, money: s.money - rod.price }));
        setOwnedRods(prev => [...prev, Number(id)]);
        playSound('cash');
      }
    } else if (type === 'location') {
      const loc = LOCATIONS.find(l => l.id === id);
      if (loc && stats.money >= loc.price) {
        setStats(s => ({ ...s, money: s.money - loc.price }));
        setUnlockedLocs(prev => [...prev, Number(id)]);
        playSound('cash');
      }
    }
  };

  const equipRod = (id: number) => setStats(s => ({ ...s, rodId: id }));
  const equipBobber = (id: string) => setStats(s => ({ ...s, bobberId: id }));
  const toggleDecor = (id: string) => {
    if (activeDecor.includes(id)) setActiveDecor(prev => prev.filter(d => d !== id));
    else setActiveDecor(prev => [...prev, id]);
  };
  const repairRod = () => {
    const rod = RODS[stats.rodId] || RODS[0];
    const cost = 100;
    if (stats.money >= cost) {
      setStats(s => ({ ...s, money: s.money - cost, rodHp: rod.maxHp }));
      playSound('success');
    }
  };
  const travel = (id: number) => setStats(s => ({ ...s, locId: id }));
  const claimQuest = (index: number) => {
    const q = quests[index];
    if (q && q.current >= q.target && !q.claimed) {
      setStats(s => ({ ...s, money: s.money + q.reward }));
      setQuests(prev => prev.map((curr, idx) => idx === index ? { ...curr, claimed: true } : curr));
      playSound('cash');
    }
  };
  const moveToAqua = (id: string) => {
    const item = bag.find(i => i.id === id);
    if (!item || aquarium.length >= stats.aquaLimit) return;
    setBag(prev => prev.filter(i => i.id !== id));
    setAquarium(prev => [...prev, item]);
  };
  const upgradeSkill = (id: string) => {
    const current = skills[id] || 0;
    const cost = (current + 1) * 1000;
    if (stats.money >= cost) {
      setStats(s => ({ ...s, money: s.money - cost }));
      setSkills(prev => ({ ...prev, [id]: current + 1 }));
      playSound('lvl');
    }
  };
  const resetGame = () => { localStorage.clear(); window.location.reload(); };
  const startNewGame = () => {
    setStats(INITIAL_STATS);
    setBag([]);
    setAquarium([]);
    setUnlockedLocs([0]);
    setOwnedRods([0]);
    setSkills({ luck: 0, haggle: 0, repair: 0, biology: 0 });
    setPedia({});
    setAchievements([]);
    setLifetimeStats(INITIAL_LIFETIME);
    localStorage.removeItem('hasan_fisherman_save_v2');
    showToast("Yeni Macera Başladı!", "text-green-400");
  };
  const closeCelebration = () => setCelebrationFish(null);
  const toggleMute = () => setIsMuted(prev => !prev);
  const getRank = () => stats.level < 5 ? "Çaylak" : "Balıkçı";
  
  const generateQuests = (locId: number) => {
    const newQuests: Quest[] = [
      { id: Date.now(), desc: "5 Balık Tut", target: 5, current: 0, reward: 500, type: 'count', claimed: false }
    ];
    setQuests(newQuests);
  };

  const startDiving = () => setGameState(GameState.DIVING);
  const endDiving = (score: number) => { setGameState(GameState.IDLE); setStats(s => ({ ...s, money: s.money + score })); };
  const playSlotMachine = (bet: number) => {
    if (stats.money < bet) return { result: ['🍋', '🍒', '🔔'], reward: 0, winType: 'none' as const };
    setStats(s => ({ ...s, money: s.money - bet }));
    const win = Math.random() < 0.2;
    return { result: win ? ['🍒', '🍒', '🍒'] : ['🍋', '🍒', '🔔'], reward: win ? bet * 5 : 0, winType: win ? 'small' as const : 'none' as const };
  };
  const claimDailyReward = () => { setDailyRewardPopup(null); };
  const upgradeWormFarm = () => {};
  const upgradeAutoNet = () => {};
  const toggleSetting = (key: any) => {};
  const collectOfflineEarnings = () => {};
  const buyPet = (id: string) => {};
  const feedPet = (id: string) => {};
  const doPrestige = () => {};
  const buyPrestigeUpgrade = (id: string) => {};
  const calculatePrestigePearls = () => 0;
  const donateFish = (id: string) => {};
  const craftItem = (recipeId: string) => {};
  const buyMerchantItem = (idx: number) => {};
  const closeTournamentResult = () => {};
  const collectCrate = () => {};
  const collectVisitorTip = () => {};
  const rerollFortune = () => {};
  const cookFish = (id: string) => {};
  const bankDeposit = (amount: number) => {};
  const bankWithdraw = (amount: number) => {};
  const cycleRadio = () => {};
  const buyIngredient = (type: any, amount: number, cost: number) => {};
  const serveCustomer = (customerId: number, fishId: string) => {};
  const rejectCustomer = (customerId: number) => {};
  const unlockRestaurant = () => {};
  const startDuel = (rivalId: string) => {};
  const surrenderDuel = () => {};
  const startTreasureHunt = () => {
    const grid: ('gold' | 'trap' | 'nothing')[] = Array(9).fill('nothing');
    // Place 2 gold and 1 trap randomly
    const indices = Array.from({length: 9}, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    grid[indices[0]] = 'gold';
    grid[indices[1]] = 'gold';
    grid[indices[2]] = 'trap';
    setTreasureGrid(grid);
  };

  const digTreasure = (index: number) => {
    const found = treasureGrid[index];
    if (found === 'gold') {
      const amount = stats.level * 500 + Math.floor(Math.random() * 1000);
      setStats(s => ({ ...s, money: s.money + amount }));
      showToast(`Hazine! +${amount}TL`, "text-yellow-400");
      playSound('cash');
      return { found, amount };
    } else if (found === 'trap') {
      playSound('fail');
      showToast("Tuzak!", "text-red-500", "Altınlarını düşürdün!");
      // Penalty: lose 5% of money
      setStats(s => ({ ...s, money: Math.max(0, s.money - Math.floor(s.money * 0.05)) }));
      return { found, amount: 0 };
    }
    return { found: 'nothing' as const, amount: 0 };
  };
  const cleanAquarium = () => {};
  const spinWheel = () => 0;

  const value = {
    stats, bag, aquarium, gameState, activeFish, weather, quests, questCooldown, skills, unlockedLocs, ownedRods, ownedBobbers, ownedDecor, activeDecor, achievements, pedia, toast, floatingTexts, celebrationFish, catchVisual, isMuted, lifetimeStats, dailyFortune, timeOfDay,
    combo, tournament, bounty, closeTournamentResult,
    filterExpiry, cleanAquarium, marketTrend, marketMultipliers, rodMastery, supplyCrate, collectCrate, activeDiscount, mysteryMerchant,
    ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
    autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, upgradeWormFarm, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
    museumStars, totalVisitors,
    ownedPets, buyPet, feedPet,
    prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
    donateFish, craftItem, buyMerchantItem,
    castRod, reelIn, sellItem, useItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, claimQuest, moveToAqua, upgradeSkill, resetGame, startNewGame, closeCelebration, playSound, toggleMute, getRank, generateQuests, startDiving, endDiving,
    hookFish,
    dailyRewardPopup, claimDailyReward,
    restaurant, activeCustomers, buyIngredient, serveCustomer, rejectCustomer, isRestaurantOpen, setIsRestaurantOpen, unlockRestaurant,
    activeEvent,
    duel, startDuel, surrenderDuel,
    startTreasureHunt, digTreasure,
    radioStation, cycleRadio, playSlotMachine
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
