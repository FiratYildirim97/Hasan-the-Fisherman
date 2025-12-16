
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, BOBBERS, DECORATIONS, CHARMS, SKILLS, LOCATIONS, FISH_DB, ACHIEVEMENTS, PETS, PRESTIGE_UPGRADES, CRAFTING_RECIPES, RIVALS, LEAGUES, WHEEL_REWARDS } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Crown, Target, TrendingUp, Sparkles, Droplets, Zap, Utensils, RefreshCw, Landmark, SlidersHorizontal, ArrowUpDown, Bell, Waves, PawPrint, Star, Hammer, Gem, Radio, Music, Dices, CalendarCheck, Menu, ChefHat, ShoppingBag, Store, Info, HandHeart, Swords, Moon, Scale, Trash2, Siren, Shovel } from 'lucide-react';
import { Modal } from './Modal';
import { ItemType, CatchItem, FishVisual } from '../types';
import { FishRenderer } from './Scene';

// ... (Section, ShopItem, StatRow, SidebarBtn - same as before)
const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2 mb-4">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 border-b border-slate-800 pb-1 mb-2">{title}</h3>
    {children}
  </div>
);

const ShopItem: React.FC<{ 
  title: string, desc: string, price: number, 
  onBuy?: () => void, owned?: boolean, equipped?: boolean, active?: boolean, 
  onEquip?: () => void, color?: string 
}> = ({ title, desc, price, onBuy, owned, equipped, active, onEquip, color }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? 'bg-green-900/20 border-green-500/50' : equipped ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}>
    <div className="flex items-center gap-3">
      {color && <div className="w-8 h-8 rounded-full border-2 border-slate-600 shadow-sm" style={{ backgroundColor: color }} />}
      <div>
        <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
          {title}
          {equipped && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">KUŞANDIN</span>}
          {active && <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">AKTİF</span>}
        </div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
    </div>
    <div>
      {owned ? (
        onEquip ? (
          !equipped && <button onClick={onEquip} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold">KUŞAN</button>
        ) : (
          <span className="text-xs font-bold text-slate-500 px-3">SAHİPSİN</span>
        )
      ) : (
        onBuy && <button onClick={onBuy} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold">{price} TL</button>
      )}
    </div>
  </div>
);

const StatRow: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-2 border-b border-slate-800 last:border-0">
    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
      {icon} {label}
    </div>
    <div className="font-mono font-bold text-slate-200">{value}</div>
  </div>
);

const SidebarBtn = ({ icon, label, onClick, badge }: any) => (
    <button onClick={() => { onClick(); }} className="w-full flex items-center gap-4 p-3 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group mb-2 active:scale-95">
        <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>
        <div className="font-bold text-slate-200 text-sm flex-1 text-left">{label}</div>
        {badge && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</div>}
    </button>
);

export const UIOverlay: React.FC = () => {
  const { 
    stats, bag, castRod, gameState, ownedRods, ownedBobbers, ownedDecor, activeDecor, unlockedLocs, skills, achievements, dailyFortune,
    sellItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, quests, claimQuest, aquarium, moveToAqua, upgradeSkill, pedia,
    isMuted, toggleMute, lifetimeStats, getRank,
    combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium,
    marketTrend, marketMultipliers, rodMastery, activeDiscount,
    ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
    autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
    startDiving, ownedPets, buyPet, feedPet,
    prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
    donateFish, craftItem, useItem, upgradeWormFarm,
    mysteryMerchant, buyMerchantItem,
    radioStation, cycleRadio, hookFish, playSlotMachine,
    dailyRewardPopup, claimDailyReward,
    restaurant, activeCustomers = [], buyIngredient, serveCustomer, rejectCustomer, isRestaurantOpen, setIsRestaurantOpen, unlockRestaurant,
    activeEvent,
    duel, startDuel, surrenderDuel,
    startTreasureHunt, digTreasure
  } = useGame();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showMarketList, setShowMarketList] = useState(true); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurantTab, setRestaurantTab] = useState<'kitchen' | 'market' | 'inventory'>('kitchen');
  const [bankAmount, setBankAmount] = useState('');
  
  const [museumLoc, setMuseumLoc] = useState<number>(stats.locId);
  const [selectedFish, setSelectedFish] = useState<string | null>(null);

  const [slotBet, setSlotBet] = useState(100);
  const [slotReels, setSlotReels] = useState(['🎰', '🎰', '🎰']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number, type: string } | null>(null);

  // Treasure Hunt State
  const [isHunting, setIsHunting] = useState(false);
  const [grid, setGrid] = useState<(null | 'dug')[]>(Array(9).fill(null));
  const [digsLeft, setDigsLeft] = useState(0);
  const [huntResult, setHuntResult] = useState<string | null>(null);

  // Wheel State
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  useEffect(() => {
      if (setIsRestaurantOpen) setIsRestaurantOpen(activeModal === 'restaurant');
  }, [activeModal, setIsRestaurantOpen]);

  const handleWheelSpin = () => {
      if (isWheelSpinning || Date.now() < spinAvailable) return;
      setIsWheelSpinning(true);
      const winningIndex = spinWheel(); 
      const segmentAngle = 360 / WHEEL_REWARDS.length;
      const targetAngle = 360 * 5 + (360 - (winningIndex * segmentAngle) - (segmentAngle/2)); 
      setWheelRotation(prev => prev + targetAngle);
      setTimeout(() => { setIsWheelSpinning(false); }, 3000);
  };

  const handleSlotSpin = () => {
      if (stats.money < slotBet) return;
      setIsSpinning(true); setLastWin(null); setSlotReels(['❓', '❓', '❓']);
      setTimeout(() => { const { result, reward, winType } = playSlotMachine(slotBet); setSlotReels(result); setIsSpinning(false); if (reward > 0) setLastWin({ amount: reward, type: winType }); }, 1000);
  };

  const initTreasureHunt = () => {
    startTreasureHunt();
    setIsHunting(true);
    setGrid(Array(9).fill(null));
    setDigsLeft(3);
    setHuntResult(null);
  };

  const handleDig = (idx: number) => {
    if (digsLeft <= 0 || grid[idx] === 'dug' || huntResult === 'BOOM') return;
    
    const result = digTreasure(idx);
    const newGrid = [...grid];
    newGrid[idx] = 'dug';
    setGrid(newGrid);
    setDigsLeft(prev => prev - 1);

    if (result.found === 'trap') {
       setHuntResult('BOOM');
       // Show feedback
    } else if (result.found === 'gold') {
       // Feedback
    }
  };

  const getBagPercent = () => (bag.length / stats.bagLimit) * 100;
  const getXpPercent = () => (stats.xp / (stats.level * 300)) * 100;
  const sortedBag = [...bag].sort((a, b) => settings.sortMode === 'value' ? b.value - a.value : settings.sortMode === 'weight' ? b.weight - a.weight : 0);
  const canDive = stats.locId >= 7; 
  const canPrestige = stats.level >= 50;
  const showPrestige = stats.level >= 50 || stats.prestigeLevel > 0;
  const currentLeague = LEAGUES.slice().reverse().find(l => stats.leaguePoints >= l.minLP) || LEAGUES[0];
  const nextLeague = LEAGUES.find(l => l.minLP > stats.leaguePoints);

  const renderBagItem = (item: CatchItem) => {
      const mult = marketMultipliers[item.name] || 1;
      const dynamicValue = Math.floor(item.value * mult);
      const isCrafted = item.type === ItemType.BAIT || item.type === ItemType.BUFF || item.type === ItemType.CHARM;
      return (
          <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.golden ? 'bg-yellow-900/40 border-yellow-400' : item.shiny ? 'bg-cyan-900/30 border-cyan-500' : isCrafted ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
                      {item.name.includes('İnci') || isCrafted ? <span className="text-2xl">{item.emoji}</span> : <div className="w-9 h-9"><FishRenderer visual={item.visual} /></div>}
                  </div>
                  <div>
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-1">{item.name}{item.golden && <span className="text-[9px] bg-yellow-500 text-black px-1 rounded font-black">ALTIN</span>}{item.shiny && !item.golden && <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">PARLAK</span>}</div>
                      <div className="text-xs text-slate-400">{item.type !== ItemType.JUNK ? <span className="flex items-center gap-1">{isCrafted ? 'Özel Eşya' : `${item.weight} kg`} • <span className={marketTrend?.fishName === item.name ? "text-green-400 font-bold" : "text-yellow-400"}> {dynamicValue} TL</span></span> : 'Değersiz'}</div>
                  </div>
              </div>
              <div className="flex gap-1">
                  {isCrafted && (<button onClick={() => useItem(item.id)} className="px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">Kullan</button>)}
                  {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => cookFish(item.id)} className="p-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-900" title="Ye"><Utensils size={14}/></button>}
                  {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => moveToAqua(item.id)} className="p-2 bg-cyan-900/50 text-cyan-400 rounded-lg hover:bg-cyan-900"><Fish size={14}/></button>}
                  <button onClick={() => sellItem(item.id)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-600/30">Sat</button>
              </div>
          </div>
      );
  };

  return (
    <>
      <Modal isOpen={!!offlineEarningsModal} onClose={collectOfflineEarnings} title="Hoşgeldin!">
          <div className="text-center py-6">
              <div className="text-4xl mb-2">💤💰</div>
              <div className="text-slate-300">Sen yokken Otomatik Ağ çalıştı!</div>
              <div className="text-3xl font-bold text-yellow-400 my-4">+{offlineEarningsModal} TL</div>
              <button onClick={collectOfflineEarnings} className="w-full py-3 bg-green-600 rounded-xl font-bold text-white">TOPLA</button>
          </div>
      </Modal>

      <Modal isOpen={!!dailyRewardPopup?.active} onClose={claimDailyReward} title="Günlük Giriş Ödülü">
          <div className="text-center py-6">
              <div className="text-5xl mb-2 animate-bounce">📅</div>
              <div className="text-slate-300 text-sm">Geri döndüğün için teşekkürler!</div>
              <div className="my-6 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">GİRİŞ SERİSİ</div>
                  <div className="text-4xl font-black text-cyan-400 mb-2">{dailyRewardPopup?.streak} GÜN</div>
              </div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">BUGÜNKÜ ÖDÜLÜN</div>
              <div className="text-3xl font-bold text-yellow-400 mb-6">+{dailyRewardPopup?.reward} TL</div>
              <button onClick={claimDailyReward} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/50">ÖDÜLÜ AL</button>
          </div>
      </Modal>

      {/* Sidebar */}
      {isSidebarOpen && (<div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto" onClick={() => setIsSidebarOpen(false)} />)}
      <div className={`fixed inset-y-0 right-0 z-[70] w-72 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pointer-events-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
              <span className="font-black text-xl text-white tracking-wider flex items-center gap-2"><Anchor size={20} className="text-cyan-400"/> MENÜ</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white active:scale-95"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <Section title="Temel">
                  <SidebarBtn icon={<Briefcase size={20} />} label="Çanta" onClick={() => { setActiveModal('bag'); setIsSidebarOpen(false); }} badge={getBagPercent() >= 100 ? 'DOLU' : bag.length > 0 ? bag.length.toString() : undefined} />
                  <SidebarBtn icon={<Swords size={20} />} label="Rekabet (Lig)" onClick={() => { setActiveModal('duels'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<ChefHat size={20} />} label="Restoran" onClick={() => { setActiveModal('restaurant'); setIsSidebarOpen(false); }} badge={!restaurant?.isUnlocked && stats.level >= 5 ? 'YENİ' : activeCustomers.length > 0 ? activeCustomers.length : undefined} />
                  <SidebarBtn icon={<Fish size={20} />} label="Akvaryum" onClick={() => { setActiveModal('aqua'); setIsSidebarOpen(false); }} badge={aquarium.length >= stats.aquaLimit ? 'DOLU' : undefined} />
                  <SidebarBtn icon={<ShoppingCart size={20} />} label="Market" onClick={() => { setActiveModal('shop'); setIsSidebarOpen(false); }} badge={activeDiscount ? '%' : undefined} />
                  <SidebarBtn icon={<ScrollText size={20} />} label="Görevler & Şans" onClick={() => { setActiveModal('quests'); setIsSidebarOpen(false); }} badge={bounty.active ? 'WANTED' : undefined} />
                  <SidebarBtn icon={<PawPrint size={20} />} label="Yoldaşlar" onClick={() => { setActiveModal('pets'); setIsSidebarOpen(false); }} />
              </Section>
              <Section title="Gelişim & Eğlence">
                  <SidebarBtn icon={<Settings size={20} />} label="Yetenekler" onClick={() => { setActiveModal('skills'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Hammer size={20} />} label="Zanaat" onClick={() => { setActiveModal('crafting'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Map size={20} />} label="Harita & Hazine" onClick={() => { setActiveModal('map'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<BookOpen size={20} />} label="Ansiklopedi (Müze)" onClick={() => { setActiveModal('pedia'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Dices size={20} />} label="Slot Makinesi" onClick={() => { setActiveModal('slots'); setIsSidebarOpen(false); }} />
              </Section>
              <Section title="Profil">
                  <SidebarBtn icon={<Trophy size={20} />} label="Kariyer & İstatistik" onClick={() => { setActiveModal('career'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Landmark size={20} />} label="Banka" onClick={() => { setActiveModal('bank'); setIsSidebarOpen(false); }} />
                  {showPrestige && <SidebarBtn icon={<Star size={20} />} label="Prestij (Rebirth)" onClick={() => { setActiveModal('prestige'); setIsSidebarOpen(false); }} badge={canPrestige ? 'HAZIR' : undefined} />}
              </Section>
          </div>
      </div>

      {/* Map Modal with Treasure Hunt */}
      <Modal isOpen={activeModal === 'map'} onClose={() => { setActiveModal(null); setIsHunting(false); }} title="Harita & Keşif">
          <div className="space-y-6">
              {!isHunting ? (
                  <>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <Map size={18} className="text-yellow-400" />
                                Hazine Adası Kazısı
                            </div>
                            <div className="text-xs text-slate-400 mt-1">4 Parça harita birleştir ve hazine ara.</div>
                        </div>
                        <button 
                            onClick={initTreasureHunt}
                            disabled={mapParts < 4}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-xs font-bold text-white flex flex-col items-center"
                        >
                            <span className="text-lg">🗺️</span>
                            {mapParts}/4 Parça
                        </button>
                    </div>

                    <Section title="Seyahat Noktaları">
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                            {LOCATIONS.map(loc => {
                                const isUnlocked = unlockedLocs.includes(loc.id);
                                return (
                                    <div key={loc.id} className={`p-3 rounded-xl border flex items-center justify-between ${stats.locId === loc.id ? 'bg-blue-900/30 border-blue-500' : isUnlocked ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{loc.icon}</div>
                                            <div>
                                                <div className="font-bold text-slate-200">{loc.name}</div>
                                                <div className="text-[10px] text-slate-400 capitalize">{loc.biome} Biyomu</div>
                                            </div>
                                        </div>
                                        {stats.locId === loc.id ? (
                                            <span className="text-xs font-bold text-blue-400 px-3">BURADASIN</span>
                                        ) : isUnlocked ? (
                                            <button onClick={() => { travel(loc.id); setActiveModal(null); }} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold">GİT</button>
                                        ) : (
                                            <button onClick={() => buyItem('location', loc.id)} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold">{loc.price} TL</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                  </>
              ) : (
                  <div className="flex flex-col items-center animate-fade-in">
                      <div className="flex justify-between w-full mb-4 px-2">
                          <button onClick={() => setIsHunting(false)} className="text-xs text-slate-400 underline">Geri Dön</button>
                          <div className="text-yellow-400 font-bold flex items-center gap-1"><Shovel size={16}/> {digsLeft} Hakkın Kaldı</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 bg-[#3d342b] p-4 rounded-xl shadow-2xl border-4 border-[#5d4037]">
                          {grid.map((cell, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleDig(idx)}
                                disabled={cell !== null || digsLeft === 0 || huntResult === 'BOOM'}
                                className={`w-20 h-20 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 transform 
                                    ${cell === null ? 'bg-[#8d6e63] hover:bg-[#a1887f] shadow-[inset_0_-4px_0_rgba(0,0,0,0.3)] active:scale-95' : 'bg-[#4e342e] shadow-inner'}
                                `}
                              >
                                  {cell === null ? '❌' : (
                                      huntResult === 'BOOM' && cell === 'dug' ? '💣' : '💎'
                                  )}
                              </button>
                          ))}
                      </div>
                      
                      {huntResult === 'BOOM' && (
                          <div className="mt-4 text-red-500 font-black animate-bounce text-xl">TUZAK! PATLADI! 💥</div>
                      )}
                      {digsLeft === 0 && !huntResult && (
                          <div className="mt-4 text-slate-400 font-bold">Kazı Bitti.</div>
                      )}
                  </div>
              )}
          </div>
      </Modal>

      {/* ... (Keep existing modals: Bag, Aqua, Shop, Quests, etc.) ... */}
      
      {/* ... Active Event & Duel Overlay ... */}

      {/* NEW COMBO BADGE */}
      {combo > 0 && (
          <div className="absolute top-28 right-4 z-40 animate-slide-in-right">
              <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-yellow-500/50 p-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex flex-col items-center animate-[pulse_2s_infinite]">
                  <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest">KOMBO</div>
                  <div className="text-3xl font-black text-white leading-none">{combo}x</div>
                  <div className="text-[10px] text-slate-400">Gelir +%{Math.min(100, combo * 5)}</div>
              </div>
          </div>
      )}

      <div className="absolute bottom-36 w-full overflow-hidden bg-slate-900/80 border-y border-white/5 backdrop-blur-sm z-20 h-6 flex items-center pointer-events-none">
          <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] text-[10px] font-mono text-cyan-300 px-4">
              📢 {newsTicker} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏦 Banka Faizi: %1/dk &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏆 Lig Sezonu Devam Ediyor!
          </div>
      </div>

      <div className="absolute top-0 w-full p-3 flex justify-between items-start z-30 pt-safe-top bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex flex-col gap-0.5 pointer-events-auto max-w-[45%]">
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap">
            <span className="text-blue-400">LVL {stats.level}</span>
            <span className="text-slate-500">|</span>
            <span className="truncate">{stats.xp}/{stats.level * 300} XP</span>
            {stats.prestigeLevel > 0 && <span className="ml-1 text-fuchsia-400">★{stats.prestigeLevel}</span>}
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 relative">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${getXpPercent()}%` }} />
            {Date.now() < buffs.xpBoostExpiry && <div className="absolute inset-0 bg-purple-500/50 animate-pulse" />}
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 flex">
             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${ecologyScore}%` }} />
          </div>
          <div className="text-[8px] text-green-300 font-bold uppercase tracking-widest">{ecologyScore >= 100 ? 'DOĞA DOSTU (BONUS AKTİF)' : 'Ekoloji Puanı'}</div>
          {marketTrend && (<div className="mt-1 text-[9px] text-green-300 font-medium bg-green-900/30 px-2 py-0.5 rounded-full inline-block border border-green-500/20 animate-pulse">📈 Trend: {marketTrend.fishName} (x{marketTrend.multiplier})</div>)}
          <div className="mt-1 flex items-center gap-1">
              <div className="text-[9px] text-amber-300 font-medium bg-amber-900/30 px-2 py-0.5 rounded-full inline-block border border-amber-500/20">🔮 {dailyFortune}</div>
              <button onClick={rerollFortune} className="p-0.5 bg-slate-800 rounded-full text-slate-400 hover:text-white" title="Falı Yenile (1000 TL)"><RefreshCw size={10} /></button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <div className="flex items-center gap-1.5">
                <div onClick={() => setActiveModal('bank')} className="bg-slate-900/60 backdrop-blur border border-yellow-500/30 px-3 py-1.5 rounded-full font-mono font-bold text-yellow-400 text-xs sm:text-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer hover:bg-slate-800 transition">{stats.money.toLocaleString()} TL</div>
                <button onClick={cycleRadio} className={`p-2 backdrop-blur border rounded-full active:scale-95 transition ${radioStation === 'off' ? 'bg-slate-900/60 border-slate-700 text-slate-400' : 'bg-slate-800 border-green-500 text-green-400 shadow-[0_0_10px_green]'}`}>
                    {radioStation === 'off' ? <Radio size={16} /> : radioStation === 'nature' ? <Waves size={16} /> : <Music size={16} />}
                </button>
                <button onClick={toggleMute} className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-slate-400 active:scale-95 transition">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-blue-600 border border-blue-400 rounded-full text-white active:scale-95 transition shadow-lg shadow-blue-900/50 animate-[pulse_3s_infinite]"><Menu size={16} /></button>
            </div>
            {Date.now() < buffs.xpBoostExpiry && (<div className="bg-purple-900/80 border border-purple-500/50 px-2 py-0.5 rounded text-[9px] text-purple-200 font-bold animate-pulse flex items-center gap-1"><Zap size={10} /> 2x XP ({Math.ceil((buffs.xpBoostExpiry - Date.now())/60000)}dk)</div>)}
            {buffs.goldenHook && (<div className="bg-yellow-900/80 border border-yellow-500/50 px-2 py-0.5 rounded text-[9px] text-yellow-200 font-bold animate-pulse flex items-center gap-1"><Anchor size={10} /> Altın İğne</div>)}
        </div>
      </div>
      
      {/* ... (Bottom Button Bar - Kept same) ... */}
      <div className="absolute bottom-0 w-full p-3 pb-safe-bottom z-30 flex flex-col gap-3 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
        <div className="flex justify-between px-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
           <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${stats.rodHp > 3 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              Can: <span className={stats.rodHp < 3 ? 'text-red-400' : 'text-slate-200'}>{Math.ceil(stats.rodHp)}/{RODS[stats.rodId].maxHp}</span>
              {rodMastery[stats.rodId] > 0 && <span className="text-purple-400 ml-1">★{Math.floor(rodMastery[stats.rodId]/50)}</span>}
           </div>
           <div className="flex items-center gap-1">Yem: <span className="text-slate-200">{stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.name : 'YOK'}</span></div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={gameState === 'BITE' ? hookFish : castRod} 
                disabled={gameState !== 'IDLE' && gameState !== 'BITE'} 
                className={`flex-1 py-4 rounded-2xl font-black text-xl tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${gameState === 'BITE' ? 'bg-red-600 animate-pulse text-white shadow-red-900/50' : gameState === 'IDLE' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40 hover:brightness-110' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            >
                {gameState === 'IDLE' ? 'OLTA AT' : gameState === 'BITE' ? 'YAKALA!' : 'BEKLENİYOR...'}
            </button>
            
            {canDive && gameState === 'IDLE' && (
                <button 
                    onClick={startDiving} 
                    className="w-20 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg shadow-cyan-900/40 active:scale-95"
                    title="Dalış Yap (500 TL)"
                >
                    <Waves size={24} />
                    <span className="text-[9px] mt-1">DALIŞ</span>
                </button>
            )}
        </div>
      </div>
    </>
  );
};
