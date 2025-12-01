
import { Rod, Location, Bait, Skill, FishBase, ItemType } from './types';

export const RODS: Rod[] = [
  { id: 0, name: "Söğüt Dalı", price: 0, maxHp: 10, power: 1, color: "#8b4513" },
  { id: 1, name: "Bambu Kamış", price: 300, maxHp: 18, power: 1.2, color: "#d4a373" },
  { id: 2, name: "Fiberglass", price: 1000, maxHp: 28, power: 1.5, color: "#cbd5e1" },
  { id: 3, name: "Kompozit", price: 2500, maxHp: 40, power: 1.8, color: "#475569" },
  { id: 4, name: "Karbon Spin", price: 6000, maxHp: 55, power: 2.2, color: "#1e293b" },
  { id: 5, name: "Surf Casting", price: 12000, maxHp: 75, power: 2.8, color: "#f59e0b" },
  { id: 6, name: "Tekne Pro", price: 30000, maxHp: 100, power: 3.5, color: "#dc2626" },
  { id: 7, name: "Turnuva Serisi", price: 75000, maxHp: 130, power: 4.5, color: "#3b82f6" },
  { id: 8, name: "Titanyum", price: 200000, maxHp: 180, power: 6.0, color: "#a855f7" },
  { id: 9, name: "Efsanevi Usta", price: 600000, maxHp: 300, power: 10.0, color: "#10b981" }
];

export const LOCATIONS: Location[] = [
  { 
    id: 0, name: "Köy Deresi", price: 0, icon: "🌲", 
    bgGradient: "from-sky-300 to-emerald-600",
    image: "https://images.unsplash.com/photo-1440557653082-e8e186733eeb?q=80&w=2560&auto=format&fit=crop" // Forest creek
  },
  { 
    id: 1, name: "Sazlık Göl", price: 500, icon: "🦆", 
    bgGradient: "from-slate-400 to-olive-600",
    image: "https://images.unsplash.com/photo-1543190829-41e97ae747ae?q=80&w=2560&auto=format&fit=crop" // Lake with reeds
  }, 
  { 
    id: 2, name: "Kayalık Sahil", price: 2000, icon: "🦀", 
    bgGradient: "from-cyan-400 to-orange-400",
    image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?q=80&w=2560&auto=format&fit=crop" // Rocky coast
  },
  { 
    id: 3, name: "Büyük Nehir", price: 5000, icon: "🏞️", 
    bgGradient: "from-sky-600 to-blue-800",
    image: "https://images.unsplash.com/photo-1544976739-16982823611a?q=80&w=2560&auto=format&fit=crop" // Big river perspective
  },
  { 
    id: 4, name: "Mercan Resifi", price: 12000, icon: "🐠", 
    bgGradient: "from-teal-400 to-cyan-700",
    image: "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?q=80&w=2560&auto=format&fit=crop" // Clear water reef
  },
  { 
    id: 5, name: "Açık Okyanus", price: 25000, icon: "🌊", 
    bgGradient: "from-blue-900 to-indigo-900",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2560&auto=format&fit=crop" // Deep sea
  },
  { 
    id: 6, name: "Amazon Nehri", price: 60000, icon: "🌴", 
    bgGradient: "from-emerald-700 to-yellow-900",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=2560&auto=format&fit=crop" // Jungle river
  },
  { 
    id: 7, name: "Norveç Fiyort", price: 150000, icon: "🏔️", 
    bgGradient: "from-slate-300 to-slate-800",
    image: "https://images.unsplash.com/photo-1506543730435-e2c1d455b57d?q=80&w=2560&auto=format&fit=crop" // Fjord
  },
  { 
    id: 8, name: "Derin Çukur", price: 500000, icon: "🌑", 
    bgGradient: "from-black to-slate-900",
    image: "https://images.unsplash.com/photo-1616327668670-692795e26325?q=80&w=2560&auto=format&fit=crop" // Dark waters
  },
  { 
    id: 9, name: "Antarktika", price: 1000000, icon: "❄️", 
    bgGradient: "from-cyan-100 to-white",
    image: "https://images.unsplash.com/photo-1549480111-53e7f9411985?q=80&w=2560&auto=format&fit=crop" // Iceberg
  }
];

export const BAITS: Bait[] = [
  { id: 'bread', name: 'Ekmek', price: 15, bonus: 1.0 },
  { id: 'worm', name: 'Solucan', price: 60, bonus: 1.2 },
  { id: 'corn', name: 'Mısır', price: 120, bonus: 1.3 },
  { id: 'shrimp', name: 'Karides', price: 500, bonus: 1.6 },
  { id: 'lure', name: 'Kaşık', price: 1200, bonus: 2.0 },
  { id: 'squid', name: 'Kalamar', price: 3000, bonus: 2.5 },
  { id: 'live', name: 'Canlı Yem', price: 6000, bonus: 3.0 }
];

export const SKILLS: Skill[] = [
  { id: 'luck', name: 'Şans', desc: 'Nadir balık ihtimali artar', max: 5, reqLvl: 2 },
  { id: 'haggle', name: 'Pazarlık', desc: '%10 daha pahalı satış', max: 5, reqLvl: 3 },
  { id: 'repair', name: 'Bakım', desc: 'Olta hasarını azaltır', max: 5, reqLvl: 5 },
  { id: 'biology', name: 'Biyoloji', desc: 'Daha büyük balıklar', max: 5, reqLvl: 8 }
];

export const FISH_DB: Record<number, FishBase[]> = {
  0: [
    { name: "Eski Çizme", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "👢" },
    { name: "Teneke", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "🥫" },
    { name: "Sazan", type: ItemType.FISH, value: 15, rarity: 1, emoji: "🐟" },
    { name: "Kızılkanat", type: ItemType.FISH, value: 25, rarity: 2, emoji: "🐠" },
    { name: "Kefal", type: ItemType.FISH, value: 35, rarity: 3, emoji: "🐟" },
    { name: "Dere Alası", type: ItemType.FISH, value: 60, rarity: 4, emoji: "🐟" },
    { name: "Altın Yüzük", type: ItemType.TREASURE, value: 250, rarity: 5, emoji: "💍" }
  ],
  1: [
    { name: "Yosun", type: ItemType.JUNK, value: 5, rarity: 1, emoji: "🌿" },
    { name: "Lastik", type: ItemType.JUNK, value: 0, rarity: 1, emoji: "⚫" },
    { name: "Turna", type: ItemType.FISH, value: 70, rarity: 2, emoji: "🦈" },
    { name: "Kadife", type: ItemType.FISH, value: 90, rarity: 3, emoji: "🐟" },
    { name: "Yayın", type: ItemType.FISH, value: 180, rarity: 4, emoji: "🐋" },
    { name: "Göl Canavarı", type: ItemType.FISH, value: 600, rarity: 5, emoji: "🐉" },
    { name: "Kırmızı Balık", type: ItemType.FISH, value: 5000, rarity: 6, emoji: "🔴" }
  ],
  2: [
    { name: "Plastik", type: ItemType.JUNK, value: 10, rarity: 1, emoji: "🥤" },
    { name: "İstavrit", type: ItemType.FISH, value: 35, rarity: 1, emoji: "🐟" },
    { name: "Mezgit", type: ItemType.FISH, value: 50, rarity: 2, emoji: "🐟" },
    { name: "Levrek", type: ItemType.FISH, value: 120, rarity: 3, emoji: "🐠" },
    { name: "Çipura", type: ItemType.FISH, value: 150, rarity: 3, emoji: "🐟" },
    { name: "Antik Sikke", type: ItemType.TREASURE, value: 900, rarity: 5, emoji: "🪙" }
  ],
  3: [{name:"Somon", type: ItemType.FISH, value:250, rarity:3, emoji:"🐟"}, {name:"Gökkuşağı", type:ItemType.FISH, value:180, rarity:2, emoji:"🌈"}],
  4: [{name:"Palyaço", type:ItemType.FISH, value:200, rarity:2, emoji:"🐠"}, {name:"İnci", type:ItemType.TREASURE, value:2000, rarity:5, emoji:"⚪"}],
  5: [{name:"Orkinos", type:ItemType.FISH, value:700, rarity:4, emoji:"🐟"}, {name:"Kılıç", type:ItemType.FISH, value:1500, rarity:5, emoji:"🗡️"}],
  6: [{name:"Pirana", type:ItemType.FISH, value:300, rarity:3, emoji:"🦷"}, {name:"Arapaima", type:ItemType.FISH, value:3500, rarity:5, emoji:"🐊"}],
  7: [{name:"Kral Somon", type:ItemType.FISH, value:900, rarity:4, emoji:"🐟"}, {name:"Kral Yengeç", type:ItemType.FISH, value:1800, rarity:5, emoji:"🦀"}],
  8: [{name:"Fener", type:ItemType.FISH, value:2500, rarity:4, emoji:"🔦"}, {name:"Dev Kalamar", type:ItemType.FISH, value:6000, rarity:5, emoji:"🦑"}],
  9: [{name:"Buzul Balığı", type:ItemType.FISH, value:1200, rarity:3, emoji:"❄️"}, {name:"Antik Kalıntı", type:ItemType.TREASURE, value:30000, rarity:5, emoji:"🏺"}]
};
