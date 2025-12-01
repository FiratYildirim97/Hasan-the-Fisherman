
export enum ItemType {
  JUNK = 'junk',
  FISH = 'fish',
  TREASURE = 'treasure'
}

export enum WeatherType {
  SUNNY = 'Sunny',
  RAIN = 'Rain',
  STORM = 'Storm'
}

export enum GameState {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  WAITING = 'WAITING',
  BITE = 'BITE',
  MINIGAME = 'MINIGAME',
  CAUGHT = 'CAUGHT',
  BROKEN = 'BROKEN'
}

export interface Rod {
  id: number;
  name: string;
  price: number;
  maxHp: number;
  power: number;
  color: string;
}

export interface Location {
  id: number;
  name: string;
  price: number;
  icon: string;
  bgGradient: string;
  image: string;
}

export interface Bait {
  id: string;
  name: string;
  price: number;
  bonus: number;
}

export interface FishBase {
  name: string;
  type: ItemType;
  value: number;
  rarity: number; // 1-6
  emoji: string;
}

export interface CatchItem extends FishBase {
  weight: number;
  id: string; // Unique ID for inventory
}

export interface Skill {
  id: 'luck' | 'haggle' | 'repair' | 'biology';
  name: string;
  desc: string;
  max: number;
  reqLvl: number;
}

export interface Quest {
  id: number;
  desc: string;
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
  type: 'count' | 'money' | 'rare';
}

export interface LifetimeStats {
  totalCaught: number;
  totalMoneyEarned: number;
  heaviestFish: number;
  legendariesCaught: number;
  playTimeMinutes: number;
}

export interface PlayerStats {
  money: number;
  xp: number;
  level: number;
  rodId: number;
  rodHp: number;
  locId: number;
  bagLimit: number;
  aquaLimit: number;
  baitId: string | null;
}

export interface PediaEntry {
  count: number;
  maxWeight: number;
}

export interface SavedGame {
  stats: PlayerStats;
  bag: CatchItem[];
  aquarium: CatchItem[];
  unlockedLocs: number[];
  ownedRods: number[];
  skills: Record<string, number>;
  pedia: Record<string, PediaEntry>;
  quests: Quest[];
  questCooldown: number;
  lastLogin: number;
  lifetimeStats: LifetimeStats;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number; // Percentage
  y: number; // Percentage
  color: string;
}

export interface CatchVisual {
  emoji: string;
  rarity: number;
  id: number;
}

// --- NEW COMPETITIVE TYPES ---

export interface TournamentState {
  active: boolean;
  timeLeft: number; // seconds
  playerScore: number;
  aiScores: { name: string; score: number }[];
  finished: boolean;
  rank: number | null;
}

export interface Bounty {
  active: boolean;
  fishName: string;
  minWeight: number;
  locId: number;
  reward: number;
  timeLeft: number; // seconds
}
