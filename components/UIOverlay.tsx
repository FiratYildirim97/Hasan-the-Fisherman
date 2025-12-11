
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, BOBBERS, DECORATIONS, CHARMS, SKILLS, LOCATIONS, FISH_DB, ACHIEVEMENTS, PETS, PRESTIGE_UPGRADES, CRAFTING_RECIPES, RIVALS, LEAGUES, WHEEL_REWARDS } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Crown, Target, TrendingUp, Sparkles, Droplets, Zap, Utensils, RefreshCw, Landmark, SlidersHorizontal, ArrowUpDown, Bell, Waves, PawPrint, Star, Hammer, Gem, Radio, Music, Dices, CalendarCheck, Menu, ChefHat, ShoppingBag, Store, Info, HandHeart, Swords, Moon, Scale, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { ItemType, CatchItem, FishVisual } from '../types';
import { FishRenderer } from './Scene';

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
    duel, startDuel, surrenderDuel
  } = useGame();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showMarketList, setShowMarketList] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurantTab, setRestaurantTab] = useState<'kitchen' | 'market' | 'inventory'>('kitchen');
  const [bankAmount, setBankAmount] = useState('');
  
  const [museumLoc, setMuseumLoc] = useState<number>(stats.locId);
  const [selectedFish, setSelectedFish] = useState<string | null>(null);

  const [slotBet, setSlotBet] = useState(100);
  const [slotReels, setSlotReels] = useState(['🎰', '🎰', '🎰']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number, type: string } | null>(null);

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

      setTimeout(() => {
          setIsWheelSpinning(false);
      }, 3000);
  };

  const handleSlotSpin = () => {
      if (stats.money < slotBet) return;
      setIsSpinning(true);
      setLastWin(null);
      setSlotReels(['❓', '❓', '❓']);

      setTimeout(() => {
          const { result, reward, winType } = playSlotMachine(slotBet);
          setSlotReels(result);
          setIsSpinning(false);
          if (reward > 0) {
              setLastWin({ amount: reward, type: winType });
          }
      }, 1000);
  };

  const getBagPercent = () => (bag.length / stats.bagLimit) * 100;
  const getXpPercent = () => (stats.xp / (stats.level * 300)) * 100;

  const sortedBag = [...bag].sort((a, b) => {
      if (settings.sortMode === 'value') return b.value - a.value;
      if (settings.sortMode === 'weight') return b.weight - a.weight;
      return 0; // recent
  });

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
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-1">
                          {item.name}
                          {item.golden && <span className="text-[9px] bg-yellow-500 text-black px-1 rounded font-black">ALTIN</span>}
                          {item.shiny && !item.golden && <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">PARLAK</span>}
                          {item.perfect && <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-black">KUSURSUZ</span>}
                      </div>
                      <div className="text-xs text-slate-400">
                          {item.type !== ItemType.JUNK ? (
                              <span className="flex items-center gap-1">
                                  {isCrafted ? 'Özel Eşya' : `${item.weight} kg`} • 
                                  <span className={marketTrend?.fishName === item.name ? "text-green-400 font-bold" : "text-yellow-400"}> {dynamicValue} TL</span>
                                  {mult > 1 && <span className="text-[10px] text-green-400 flex items-center">▲ %{Math.round((mult-1)*100)}</span>}
                                  {mult < 1 && <span className="text-[10px] text-red-400 flex items-center">▼ %{Math.round((1-mult)*100)}</span>}
                                  {marketTrend?.fishName === item.name && " (Trend)"}
                              </span>
                          ) : 'Değersiz'}
                      </div>
                  </div>
              </div>
              <div className="flex gap-1">
                  {isCrafted && (
                      <button onClick={() => useItem(item.id)} className="px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">Kullan</button>
                  )}
                  {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => cookFish(item.id)} className="p-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-900" title="Balık Ekmek Yap (Ye)"><Utensils size={14}/></button>}
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
                  <div className="flex gap-1 justify-center">
                      {[1,2,3,4,5,6,7].map(d => (
                          <div key={d} className={`w-2 h-2 rounded-full ${dailyRewardPopup && d <= dailyRewardPopup.streak ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                      ))}
                  </div>
              </div>

              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">BUGÜNKÜ ÖDÜLÜN</div>
              <div className="text-3xl font-bold text-yellow-400 mb-6">+{dailyRewardPopup?.reward} TL</div>
              
              <button onClick={claimDailyReward} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/50">
                  ÖDÜLÜ AL
              </button>
          </div>
      </Modal>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto" onClick={() => setIsSidebarOpen(false)} />
      )}

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
                  <SidebarBtn icon={<ScrollText size={20} />} label="Görevler & Çark" onClick={() => { setActiveModal('quests'); setIsSidebarOpen(false); }} badge={quests.some(q => !q.claimed && q.current >= q.target) ? '!' : undefined} />
                  <SidebarBtn icon={<PawPrint size={20} />} label="Yoldaşlar" onClick={() => { setActiveModal('pets'); setIsSidebarOpen(false); }} />
              </Section>
              
              <Section title="Gelişim & Eğlence">
                  <SidebarBtn icon={<Settings size={20} />} label="Yetenekler" onClick={() => { setActiveModal('skills'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Hammer size={20} />} label="Zanaat" onClick={() => { setActiveModal('crafting'); setIsSidebarOpen(false); }} />
                  <SidebarBtn icon={<Map size={20} />} label="Harita" onClick={() => { setActiveModal('map'); setIsSidebarOpen(false); }} />
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

      <Modal isOpen={activeModal === 'bag'} onClose={() => setActiveModal(null)} title={`Sırt Çantası (${bag.length}/${stats.bagLimit})`}>
          <div className="flex justify-between mb-4">
              <button onClick={() => toggleSetting('sortMode')} className="text-xs bg-slate-800 p-2 rounded text-slate-300 flex items-center gap-1"><ArrowUpDown size={12}/> {settings.sortMode === 'recent' ? 'Son' : settings.sortMode === 'value' ? 'Değer' : 'Ağırlık'}</button>
              <div className="flex gap-2">
                  <button onClick={recycleJunk} className="bg-orange-700 px-3 py-1 rounded text-xs font-bold text-white flex items-center gap-1"><Recycle size={12}/> Dönüşüm</button>
                  <button onClick={sellAll} className="bg-green-700 px-3 py-1 rounded text-xs font-bold text-white">Tümünü Sat</button>
              </div>
          </div>
          <div className="space-y-2">
              {bag.length === 0 ? <div className="text-center text-slate-500 py-8">Çantanız boş.</div> : sortedBag.map(renderBagItem)}
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'duels'} onClose={() => setActiveModal(null)} title="Rekabet Ligi">
          <div className="space-y-6">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
                  <div className={`absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-${currentLeague.color.replace('text-', 'bg-')}/50 to-transparent`} />
                  <div className={`text-6xl mb-2 ${currentLeague.color}`}>{currentLeague.icon}</div>
                  <div className={`text-2xl font-black ${currentLeague.color} uppercase tracking-widest`}>{currentLeague.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{stats.leaguePoints} LP</div>
                  {nextLeague && (
                      <div className="mt-4">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Sonraki Lig: {nextLeague.name}</span>
                              <span>{nextLeague.minLP - stats.leaguePoints} LP kaldı</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${nextLeague.color.replace('text-', 'bg-')} transition-all duration-500`} style={{ width: `${Math.min(100, ((stats.leaguePoints - currentLeague.minLP) / (nextLeague.minLP - currentLeague.minLP)) * 100)}%` }} />
                          </div>
                      </div>
                  )}
              </div>
              <Section title="Rakipler">
                  <div className="space-y-3">
                      {RIVALS.map(rival => {
                          const unlocked = stats.leaguePoints >= (LEAGUES.find(l => l.id === rival.minLeague)?.minLP || 0);
                          const active = duel.active && duel.rivalId === rival.id;
                          return (
                              <div key={rival.id} className={`p-3 rounded-xl border flex items-center justify-between ${active ? 'bg-red-900/30 border-red-500 animate-pulse' : unlocked ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-2xl border border-slate-600">{rival.icon}</div>
                                      <div>
                                          <div className="font-bold text-slate-200">{rival.name}</div>
                                          <div className="text-[10px] text-slate-400">{rival.title}</div>
                                          <div className="flex gap-2 mt-1">
                                              <span className="text-[9px] bg-slate-700 px-1.5 rounded text-white">Zorluk: {rival.difficulty}/10</span>
                                              <span className="text-[9px] bg-yellow-900/30 text-yellow-400 px-1.5 rounded border border-yellow-500/20">+{rival.rewardLP} LP</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button onClick={() => { setActiveModal(null); startDuel(rival.id); }} disabled={!unlocked || duel.active} className={`px-4 py-2 rounded-lg text-xs font-bold ${active ? 'bg-red-600 text-white' : unlocked && !duel.active ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'}`}>{active ? 'SAVAŞTA' : unlocked ? 'DÜELLO' : 'KİLİTLİ'}</button>
                              </div>
                          );
                      })}
                  </div>
              </Section>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'quests'} onClose={() => setActiveModal(null)} title="Görevler & Şans">
          <div className="space-y-6">
              <div className="bg-gradient-to-b from-purple-900/50 to-slate-900 p-4 rounded-3xl border border-purple-500/30 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.2)_0%,transparent_70%)] pointer-events-none" />
                  
                  <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-widest mb-4 flex items-center gap-2">
                      <Dices size={20} /> GÜNLÜK ÇARK
                  </h3>

                  <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-white filter drop-shadow-lg text-3xl">▼</div>
                      
                      <div 
                          className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                          style={{ 
                              transform: `rotate(${wheelRotation}deg)`,
                              background: `conic-gradient(
                                  ${WHEEL_REWARDS.map((r, i) => `${r.color} ${i * (360/8)}deg ${(i+1) * (360/8)}deg`).join(', ')}
                              )` 
                          }}
                      >
                          {WHEEL_REWARDS.map((r, i) => (
                              <div 
                                  key={r.id} 
                                  className="absolute top-0 left-1/2 w-full h-full origin-bottom-left flex justify-center pt-2"
                                  style={{ 
                                      transform: `rotate(${i * (360/8) + (360/16)}deg) translate(-50%, 0)`,
                                      transformOrigin: '50% 50%' 
                                  }}
                              >
                                  <div className="text-[10px] font-bold text-white drop-shadow-md text-center w-12 -mt-20 transform -rotate-90">
                                      {r.type === 'money' ? '💰' : r.type === 'buff' ? '⚡' : r.type === 'currency' ? '💎' : '🎁'}
                                  </div>
                              </div>
                          ))}
                          <div className="absolute inset-0 rounded-full border-[10px] border-slate-900/20 pointer-events-none" />
                      </div>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-4 border-slate-300 flex items-center justify-center z-10">
                          <div className="w-8 h-8 bg-slate-800 rounded-full" />
                      </div>
                  </div>

                  <button 
                      onClick={handleWheelSpin} 
                      disabled={isWheelSpinning || Date.now() < spinAvailable}
                      className={`mt-6 px-8 py-3 rounded-full font-black text-white shadow-lg transition-all active:scale-95 z-10 ${isWheelSpinning || Date.now() < spinAvailable ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 shadow-purple-900/50 animate-pulse'}`}
                  >
                      {isWheelSpinning ? 'DÖNÜYOR...' : Date.now() < spinAvailable ? `SÜRE: ${Math.ceil((spinAvailable - Date.now())/3600000)}s` : 'ÇEVİR!'}
                  </button>
                  {Date.now() < spinAvailable && (
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">
                          Sonraki Çevirme: {new Date(spinAvailable).toLocaleTimeString()}
                      </div>
                  )}
              </div>

              <Section title="Günlük Görevler">
                  <div className="space-y-3">
                      {quests.map((q, i) => {
                          const isMoney = q.type === 'money';
                          const isRare = q.type === 'rare';
                          const isJunk = q.type === 'junk';
                          const isNight = q.type === 'night';
                          const isWeight = q.type === 'weight';
                          
                          return (
                              <div key={q.id} className={`p-3 rounded-xl border flex justify-between items-center ${q.claimed ? 'bg-slate-800/50 border-slate-800 opacity-50' : 'bg-slate-800 border-slate-700'}`}>
                                  <div className="flex items-center gap-3 flex-1 mr-2">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isMoney ? 'bg-green-900/50 text-green-400' : isRare ? 'bg-purple-900/50 text-purple-400' : isJunk ? 'bg-orange-900/50 text-orange-400' : isNight ? 'bg-indigo-900/50 text-indigo-400' : isWeight ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                          {isMoney ? <TrendingUp size={18}/> : isRare ? <Star size={18}/> : isJunk ? <Trash2 size={18}/> : isNight ? <Moon size={18}/> : isWeight ? <Scale size={18}/> : <Target size={18}/>}
                                      </div>
                                      <div className="flex-1">
                                          <div className="font-bold text-slate-200 text-sm mb-1">{q.desc}</div>
                                          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                              <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${Math.min(100, (q.current/q.target)*100)}%` }} />
                                          </div>
                                          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                              <span>{Math.round(q.current * 10) / 10} / {q.target}</span>
                                              <span className="text-yellow-400 font-bold">{q.reward} TL</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => claimQuest(i)} 
                                    disabled={q.claimed || q.current < q.target}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${q.claimed ? 'text-green-500 border border-green-900/30' : q.current >= q.target ? 'bg-green-600 text-white animate-pulse shadow-lg shadow-green-900/50 scale-105' : 'bg-slate-700 text-slate-500'}`}
                                  >
                                      {q.claimed ? 'TAMAM' : 'AL'}
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              </Section>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'shop'} onClose={() => setActiveModal(null)} title="Market">
          <div className="space-y-6">
              <div className="bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-750" onClick={() => setShowMarketList(!showMarketList)}>
                 <div className="flex items-center gap-2 text-blue-300 font-bold"><TrendingUp size={16}/> Borsa Durumu</div>
                 <div className="text-xs text-slate-400">{showMarketList ? 'Gizle' : 'Göster'}</div>
              </div>
              
              {showMarketList && (
                  <div className="bg-slate-900 p-2 rounded border border-slate-700 max-h-40 overflow-y-auto">
                      {Object.entries(marketMultipliers).sort(([, a], [, b]) => (b as number) - (a as number)).map(([name, mult]) => (
                          <div key={name} className="flex justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                              <span className="text-slate-300">{name}</span>
                              <span className={(mult as number) > 1 ? 'text-green-400' : (mult as number) < 1 ? 'text-red-400' : 'text-slate-400'}>%{Math.round(((mult as number) - 1) * 100)}</span>
                          </div>
                      ))}
                  </div>
              )}

              <Section title="Yemler">
                  <div className="grid grid-cols-2 gap-2">
                      {BAITS.map(bait => (
                          <ShopItem key={bait.id} title={bait.name} desc={`x${bait.bonus} Şans`} price={bait.price} owned={false} onBuy={() => buyItem('bait', bait.id)} />
                      ))}
                  </div>
              </Section>
              
              <Section title="Oltalar">
                  <div className="space-y-2">
                      {RODS.map(rod => {
                          const owned = ownedRods.includes(rod.id);
                          return (
                              <ShopItem key={rod.id} title={rod.name} desc={`Güç: ${rod.power} | HP: ${rod.maxHp}`} price={rod.price} owned={owned} equipped={stats.rodId === rod.id} onBuy={() => buyItem('rod', rod.id)} onEquip={() => equipRod(rod.id)} color={rod.color} />
                          );
                      })}
                  </div>
              </Section>

              <Section title="Geliştirmeler">
                   <ShopItem title="Çanta Genişletme" desc={`Kapasite: ${stats.bagLimit} -> ${stats.bagLimit + 5}`} price={500} onBuy={() => buyItem('upgrade', 'bag')} />
                   <ShopItem title={`Otomatik Ağ (Lvl ${autoNetLevel})`} desc="Dakikada pasif gelir sağlar" price={(autoNetLevel + 1) * 2000} onBuy={upgradeAutoNet} />
                   <ShopItem title={`Solucan Çiftliği (Lvl ${stats.wormFarmLevel})`} desc="Bedava yem üretir" price={(stats.wormFarmLevel + 1) * 2500} onBuy={upgradeWormFarm} />
              </Section>

              <Section title="Özel Eşyalar & Tılsımlar">
                  <div className="space-y-2">
                      {CHARMS.map(charm => (
                          <ShopItem key={charm.id} title={charm.name} desc={charm.desc} price={charm.price} owned={ownedCharms.includes(charm.id)} onBuy={() => buyItem('charm', charm.id)} />
                      ))}
                      <ShopItem title="Altın İğne" desc="Sıradaki balık %100 Nadir+" price={1000} onBuy={() => buyItem('buff', 'golden')} />
                      <ShopItem title="Enerji İçeceği" desc="5 dakika boyunca x2 XP" price={250} onBuy={() => buyItem('buff', 'energy')} />
                  </div>
              </Section>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'restaurant'} onClose={() => setActiveModal(null)} title="Balık Restoranı">
          {restaurant && !restaurant.isUnlocked ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-6">
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl w-full">
                      <div className="text-6xl mb-4">🏪</div>
                      <h2 className="text-2xl font-black text-white mb-2">SATILIK DÜKKAN</h2>
                      <p className="text-slate-400 text-sm mb-6">Kendi balık restoranını işlet, müşterilerine lezzetli yemekler sun ve itibar kazan!</p>
                      
                      <div className="flex flex-col gap-3">
                          <div className={`p-3 rounded-xl border flex justify-between items-center ${stats.level >= 5 ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                              <span className="text-sm font-bold text-slate-300">Gereksinim</span>
                              <span className={stats.level >= 5 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>Seviye 5+</span>
                          </div>
                          
                          <button 
                              onClick={unlockRestaurant} 
                              disabled={stats.level < 5}
                              className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                              <Store size={20} />
                              SATIN AL (30.000 TL)
                          </button>
                      </div>
                  </div>
              </div>
          ) : (
              <>
                  {restaurant && (
                      <div className="mb-4 bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xl font-bold text-yellow-500">
                                  {restaurant.level}
                              </div>
                              <div>
                                  <div className="text-xs text-slate-400 font-bold uppercase">Restoran Seviyesi</div>
                                  <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${(restaurant.reputation % 100)}%` }} />
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-slate-400 font-bold uppercase">İtibar</div>
                              <div className="font-mono text-white font-bold">{restaurant.reputation}</div>
                          </div>
                      </div>
                  )}

                  <div className="flex gap-2 mb-4">
                      <button onClick={() => setRestaurantTab('kitchen')} className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${restaurantTab === 'kitchen' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Mutfak & Servis</button>
                      <button onClick={() => setRestaurantTab('market')} className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${restaurantTab === 'market' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Hal (Pazar)</button>
                      <button onClick={() => setRestaurantTab('inventory')} className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${restaurantTab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Kiler</button>
                  </div>

                  {restaurantTab === 'inventory' && restaurant && (
                      <div className="grid grid-cols-2 gap-3 animate-fade-in">
                          <StatRow label="Sebze" value={restaurant.ingredients.vegetables} icon={<span>🥗</span>} />
                          <StatRow label="Yağ" value={restaurant.ingredients.oil} icon={<span>🍶</span>} />
                          <StatRow label="Meze" value={restaurant.ingredients.meze} icon={<span>🧀</span>} />
                          <StatRow label="Rakı" value={restaurant.ingredients.raki} icon={<span>🍼</span>} />
                      </div>
                  )}

                  {restaurantTab === 'market' && (
                      <div className="space-y-3 animate-fade-in">
                          <div className="text-center text-xs text-slate-400 mb-2">Malzemeleri buradan temin edebilirsin.</div>
                          <ShopItem title="Taze Sebzeler" desc="Domates, Biber, Soğan (5 Adet)" price={250} onBuy={() => buyIngredient('vegetables', 5, 250)} />
                          <ShopItem title="Ayçiçek Yağı" desc="Kızartma için (5 Adet)" price={150} onBuy={() => buyIngredient('oil', 5, 150)} />
                          <ShopItem title="Meze Tabağı" desc="Peynir, Kavun, Haydari (2 Adet)" price={400} onBuy={() => buyIngredient('meze', 2, 400)} />
                          <ShopItem title="Yeni Rakı" desc="Aslan Sütü (1 Adet)" price={500} onBuy={() => buyIngredient('raki', 1, 500)} />
                      </div>
                  )}

                  {restaurantTab === 'kitchen' && (
                      <div className="space-y-4 animate-fade-in">
                          {activeCustomers.length === 0 ? (
                              <div className="text-center py-10 opacity-50">
                                  <div className="text-4xl mb-2">🍽️</div>
                                  <div>Müşteri Bekleniyor...</div>
                              </div>
                          ) : (
                              activeCustomers.map(customer => {
                                  // @ts-ignore
                                  const isVip = customer.isVip;
                                  
                                  const hasIngredients = restaurant && (
                                      (customer.order === 'sandwich' && restaurant.ingredients.vegetables >= 1) ||
                                      (customer.order === 'grilled' && restaurant.ingredients.vegetables >= 1 && restaurant.ingredients.oil >= 1) ||
                                      (customer.order === 'raki_table' && restaurant.ingredients.vegetables >= 2 && restaurant.ingredients.meze >= 2 && restaurant.ingredients.raki >= 1 && restaurant.ingredients.oil >= 1)
                                  );
                                  
                                  const matchingFish = bag.find(f => 
                                      f.type === ItemType.FISH && 
                                      f.rarity >= customer.fishReq.rarity && 
                                      f.weight >= customer.fishReq.minWeight
                                  );

                                  return (
                                      <div key={customer.id} className={`p-3 rounded-xl border animate-slide-up shadow-lg ${isVip ? 'bg-indigo-900/50 border-yellow-400 shadow-yellow-900/30' : 'bg-slate-800 border-slate-700'}`}>
                                          <div className="flex justify-between items-start mb-2">
                                              <div>
                                                  <div className={`font-bold flex items-center gap-2 ${isVip ? 'text-yellow-300' : 'text-white'}`}>
                                                      {isVip && <Crown size={14} className="animate-bounce text-yellow-400"/>}
                                                      {customer.name}
                                                      <span className={`text-[10px] px-1.5 rounded border ${isVip ? 'bg-yellow-600/30 border-yellow-500 text-yellow-200' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                                                          {customer.order === 'sandwich' ? '🥪 Balık Ekmek' : customer.order === 'grilled' ? '🔥 Izgara' : '🍼 Rakı Sofrası'}
                                                      </span>
                                                  </div>
                                                  <div className="text-xs text-slate-400 mt-1">
                                                      İstek: {customer.fishReq.rarity > 1 ? 'Nadir' : 'Sıradan'} Balık ({Math.floor(customer.fishReq.minWeight)}kg+)
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <div className={`text-xs font-bold ${customer.patience < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>{Math.floor(customer.patience)}% Sabır</div>
                                              </div>
                                          </div>
                                          
                                          <div className="flex gap-2 mt-3">
                                              {hasIngredients ? (
                                                  matchingFish ? (
                                                      <button onClick={() => serveCustomer(customer.id, matchingFish.id)} className={`flex-1 py-2 rounded text-white text-xs font-bold transition-colors ${isVip ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:brightness-110' : 'bg-green-600 hover:bg-green-500'}`}>
                                                          SERVİS ET ({matchingFish.name})
                                                      </button>
                                                  ) : (
                                                      <div className="flex-1 py-2 bg-slate-700 text-slate-500 rounded text-xs font-bold text-center border border-slate-600">
                                                          UYGUN BALIK YOK
                                                      </div>
                                                  )
                                              ) : (
                                                  <div className="flex-1 py-2 bg-red-900/30 text-red-400 rounded text-xs font-bold text-center border border-red-500/30">
                                                      MALZEME EKSİK
                                                  </div>
                                              )}
                                              <button onClick={() => rejectCustomer(customer.id)} className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-200 rounded text-xs font-bold transition-colors">X</button>
                                          </div>
                                      </div>
                                  );
                              })
                          )}
                      </div>
                  )}
              </>
          )}
      </Modal>

      <Modal isOpen={activeModal === 'pets'} onClose={() => setActiveModal(null)} title="Yoldaşlar">
          <div className="grid grid-cols-2 gap-2">
              {PETS.map(pet => {
                  const owned = ownedPets.find(p => p.id === pet.id);
                  return (
                      <button key={pet.id} onClick={() => owned ? feedPet(pet.id) : buyPet(pet.id)} className={`p-3 border rounded-xl text-left relative overflow-hidden ${owned ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900 border-slate-700 opacity-80'}`}>
                          <div className="flex justify-between items-start mb-1">
                              <div className="text-3xl">{pet.icon}</div>
                              {owned && <div className="text-[10px] bg-cyan-900/50 text-cyan-300 px-1.5 rounded">Lvl {owned.level}</div>}
                          </div>
                          <div className="font-bold text-sm text-slate-200">{pet.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight my-1">{pet.desc}</div>
                          {owned ? (
                              <div className="mt-2">
                                  <div className="flex justify-between text-[9px] text-slate-400 mb-0.5"><span>Açlık</span><span>{owned.hunger}%</span></div>
                                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${owned.hunger < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${owned.hunger}%` }} /></div>
                                  <div className="text-[9px] text-center mt-1 text-cyan-400 font-bold">BESLE (Balık/Çöp)</div>
                              </div>
                          ) : (
                              <div className="text-yellow-400 font-bold text-xs mt-1">{pet.price} TL</div>
                          )}
                      </button>
                  );
              })}
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'crafting'} onClose={() => setActiveModal(null)} title="Zanaat Masası">
          <div className="space-y-2">
              {CRAFTING_RECIPES.map(recipe => {
                  const canCraft = recipe.inputs.every(inp => bag.filter(i => i.name === inp.itemName).length >= inp.count);
                  return (
                      <div key={recipe.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                          <div>
                              <div className="font-bold text-slate-200">{recipe.name}</div>
                              <div className="text-xs text-slate-400 mb-1">{recipe.desc}</div>
                              <div className="text-[10px] text-slate-500">Gereken: {recipe.inputs.map(i => `${i.count}x ${i.itemName}`).join(', ')}</div>
                          </div>
                          <button onClick={() => craftItem(recipe.id)} disabled={!canCraft} className={`px-4 py-2 rounded-lg text-xs font-bold ${canCraft ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                              ÜRET
                          </button>
                      </div>
                  );
              })}
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'skills'} onClose={() => setActiveModal(null)} title="Yetenekler"><div className="space-y-2">{SKILLS.map(s => { const lvl = skills[s.id] || 0; const cost = (lvl + 1) * 500; const locked = stats.level < s.reqLvl; const maxed = lvl >= s.max; return (<div key={s.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center"><div><div className="font-bold text-sm text-slate-200 flex items-center gap-2">{s.name} <span className="text-xs text-blue-400 bg-blue-900/30 px-1.5 rounded">Lvl {lvl}</span></div><div className="text-xs text-slate-400 mt-0.5">{s.desc}</div></div>{maxed ? (<span className="text-xs font-bold text-green-500 px-3">MAX</span>) : locked ? (<span className="text-xs font-bold text-red-500 bg-red-900/10 px-2 py-1 rounded">Lvl {s.reqLvl} Gerekli</span>) : (<button onClick={() => upgradeSkill(s.id)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold">{cost} TL</button>)}</div>)})}</div></Modal>

      <Modal isOpen={activeModal === 'decor'} onClose={() => setActiveModal(null)} title="Dekorasyon">
          <div className="grid grid-cols-3 gap-2">
              {DECORATIONS.map(decor => (
                  <button key={decor.id} onClick={() => ownedDecor.includes(decor.id) ? toggleDecor(decor.id) : buyItem('decor', decor.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${activeDecor.includes(decor.id) ? 'bg-purple-900/50 border-purple-500' : 'bg-slate-800 border-slate-700'}`}>
                      <span className="text-2xl">{decor.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-300">{decor.name}</span>
                      {!ownedDecor.includes(decor.id) && <span className="text-[10px] text-yellow-400">{decor.price} TL</span>}
                  </button>
              ))}
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'prestige'} onClose={() => setActiveModal(null)} title="Prestij (Rebirth)">
          <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-fuchsia-900 to-slate-900 p-6 rounded-2xl border border-fuchsia-500/30">
                  <h3 className="text-2xl font-black text-white mb-2">Seviye 50+</h3>
                  <p className="text-sm text-slate-300 mb-4">Her şeyi sıfırla, kalıcı İnci kazan!</p>
                  <div className="text-4xl mb-4 animate-bounce">🌀</div>
                  <div className="bg-slate-900/50 p-3 rounded-xl mb-4">
                      <div className="text-xs text-slate-400">Tahmini Kazanç</div>
                      <div className="text-xl font-bold text-fuchsia-400">+{calculatePrestigePearls()} İnci</div>
                  </div>
                  <button onClick={() => { if(window.confirm("Emin misin? Her şey sıfırlanacak!")) doPrestige(); }} disabled={stats.level < 50} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-white shadow-lg transition-all">
                      PRESTİJ YAP
                  </button>
              </div>
              <Section title="İnci Marketi">
                  <div className="grid grid-cols-2 gap-2">
                      {PRESTIGE_UPGRADES.map(upg => (
                          <button key={upg.id} onClick={() => buyPrestigeUpgrade(upg.id)} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-left hover:bg-slate-700 transition">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-xl">{upg.icon}</span>
                                  <span className="text-xs font-bold text-fuchsia-400">{upg.cost} İnci</span>
                              </div>
                              <div className="font-bold text-slate-200 text-sm">{upg.name}</div>
                              <div className="text-[10px] text-slate-400">{upg.desc}</div>
                              <div className="text-[10px] text-blue-400 mt-1">Lvl {prestigeUpgrades[upg.id] || 0}/{upg.maxLevel}</div>
                          </button>
                      ))}
                  </div>
              </Section>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'merchant'} onClose={() => setActiveModal(null)} title="Gizemli Tüccar">
          {mysteryMerchant && mysteryMerchant.active ? (
              <div className="space-y-4 text-center">
                  <div className="text-4xl animate-bounce">🧞‍♂️</div>
                  <div className="text-purple-300 text-sm">"Nadir mallarım var, ama vaktim az..."</div>
                  <div className="text-xs text-slate-500 font-mono">Kalan Süre: {Math.ceil((mysteryMerchant.expiry - Date.now())/1000)}s</div>
                  <div className="grid grid-cols-1 gap-2 text-left">
                      {mysteryMerchant.items.map((item, idx) => (
                          <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-purple-500/30 flex justify-between items-center">
                              <div>
                                  <div className="font-bold text-purple-200">{item.name}</div>
                                  <div className="text-xs text-slate-400">{item.type.toUpperCase()}</div>
                              </div>
                              <button onClick={() => buyMerchantItem(idx)} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-bold text-xs">{item.price} TL</button>
                          </div>
                      ))}
                  </div>
              </div>
          ) : (
              <div className="text-center py-10 text-slate-500">Tüccar şu an burada değil.</div>
          )}
      </Modal>

      <Modal isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)} title="Banka">
          <div className="space-y-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
                  <h3 className="font-bold text-slate-400 mb-1 text-xs uppercase">HESAP BAKİYESİ</h3>
                  <div className="text-3xl font-black text-green-400 mb-2">{stats.bankBalance.toLocaleString()} TL</div>
                  <div className="text-xs text-slate-500">Faiz Oranı: %1 / dakika</div>
              </div>
              <div className="flex gap-2">
                  <input type="number" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} placeholder="Miktar" className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white w-full font-mono" />
              </div>
              <div className="flex gap-2">
                  <button onClick={() => bankDeposit(Number(bankAmount))} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-white text-sm">YATIR</button>
                  <button onClick={() => bankWithdraw(Number(bankAmount))} className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold text-white text-sm">ÇEK</button>
              </div>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'career'} onClose={() => setActiveModal(null)} title="Kariyer">
         <div className="flex flex-col items-center py-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-4"><div className="text-5xl mb-2">🏆</div><div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Mevcut Rütbe</div><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{getRank()}</div></div>
         <Section title="İstatistikler"><div className="space-y-2 mb-4">
             <StatRow label="Toplam Yakalanan" value={lifetimeStats.totalCaught} icon={<Fish size={14}/>} />
             <StatRow label="Toplam Kazanç" value={`${lifetimeStats.totalMoneyEarned.toLocaleString()} TL`} icon={<TrendingUp size={14}/>} />
             <StatRow label="En Ağır Balık" value={`${lifetimeStats.heaviestFish} kg`} icon={<Anchor size={14}/>} />
             <StatRow label="Efsanevi" value={lifetimeStats.legendariesCaught} icon={<Crown size={14} className="text-yellow-500"/>} />
             <StatRow label="Parlak (Shiny)" value={lifetimeStats.shinyCaught} icon={<Sparkles size={14} className="text-cyan-400"/>} />
             <StatRow label="Altın (Golden)" value={lifetimeStats.goldenCaught} icon={<Target size={14} className="text-yellow-400"/>} />
             <StatRow label="Çevrimdışı Gelir" value={`${lifetimeStats.offlineEarnings.toLocaleString()} TL`} icon={<Briefcase size={14}/>} />
         </div></Section>
         <Section title="Başarımlar"><div className="grid grid-cols-3 gap-2">{ACHIEVEMENTS.map(ach => { const unlocked = achievements.includes(ach.id); return (<div key={ach.id} className={`p-2 rounded-lg border flex flex-col items-center text-center ${unlocked ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}><div className="text-2xl mb-1">{ach.icon}</div><div className={`text-[10px] font-bold ${unlocked ? 'text-yellow-200' : 'text-slate-500'}`}>{ach.title}</div></div>) })}</div></Section>
      </Modal>

      <Modal isOpen={activeModal === 'map'} onClose={() => setActiveModal(null)} title="Harita">
          {mapParts < 4 && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl flex items-center gap-4">
                  <div className="text-2xl">🗺️</div>
                  <div>
                      <div className="text-amber-200 font-bold text-sm">Hazine Haritası</div>
                      <div className="text-xs text-amber-400/70">Parçalar: {mapParts}/4 (Çöplerden bulabilirsin)</div>
                  </div>
              </div>
          )}
          <div className="space-y-2">{LOCATIONS.map(l => { const unlocked = unlockedLocs.includes(l.id); const current = stats.locId === l.id; return (<div key={l.id} className={`flex items-center justify-between p-3 rounded-xl border ${current ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700 opacity-90'}`}><div className="flex items-center gap-3"><span className="text-2xl grayscale-[50%]">{l.icon}</span><span className={`font-bold text-sm ${current ? 'text-blue-300' : 'text-slate-300'}`}>{l.name}</span></div>{unlocked ? (current ? <span className="text-xs font-bold text-blue-400 px-3">BURADASIN</span> : <button onClick={() => {travel(l.id); setActiveModal(null)}} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white">GİT</button>) : (<button onClick={() => buyItem('location', l.id)} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs font-bold text-white flex gap-1 items-center">{l.price} TL</button>)}</div>)})}</div></Modal>
      
      <Modal isOpen={activeModal === 'pedia'} onClose={() => { setActiveModal(null); setSelectedFish(null); }} title="Ansiklopedi & Müze">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {LOCATIONS.filter(l => unlockedLocs.includes(l.id)).map(l => (
                  <button key={l.id} onClick={() => { setMuseumLoc(l.id); setSelectedFish(null); }} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${museumLoc === l.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {l.name}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {Object.values(FISH_DB[museumLoc] || []).filter(f => f.type !== ItemType.JUNK).map((f, i) => {
                  const entry = pedia[f.name];
                  const caught = !!entry;
                  return (
                      <div 
                          key={i} 
                          onClick={() => caught && setSelectedFish(f.name)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center border relative cursor-pointer hover:border-cyan-400 transition-colors ${entry ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50'}`}
                      >
                          {entry ? (
                              <div className="w-10 h-10"><FishRenderer visual={f.visual} /></div>
                          ) : (
                              <div className="text-2xl grayscale brightness-0 opacity-30">?</div>
                          )}
                          
                          {entry && entry.donated && (
                              <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-[8px] px-1 rounded-tl shadow">MÜZE</div>
                          )}
                          {entry && !entry.donated && bag.some(b => b.name === f.name) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          )}
                      </div>
                  );
              })}
          </div>

          {selectedFish && (
              <div className="mt-4 p-4 bg-slate-800 rounded-2xl border border-slate-700 animate-slide-up">
                  {(() => {
                      const fishDef = Object.values(FISH_DB[museumLoc]).find(f => f.name === selectedFish);
                      const entry = pedia[selectedFish];
                      const inBagItem = bag.find(b => b.name === selectedFish);

                      if (!fishDef || !entry) return null;

                      return (
                          <div className="flex gap-4">
                              <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-600">
                                  <div className="w-16 h-16"><FishRenderer visual={fishDef.visual} /></div>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-white text-lg">{fishDef.name}</h3>
                                      {entry.donated ? (
                                          <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-500/30 flex items-center gap-1"><Landmark size={10}/> Müzede</span>
                                      ) : (
                                          inBagItem && (
                                              <button onClick={() => donateFish(inBagItem.id)} className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded font-bold flex items-center gap-1 animate-pulse">
                                                  <HandHeart size={10} /> BAĞIŞLA
                                              </button>
                                          )
                                      )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div className="text-xs text-slate-400 bg-slate-900/50 p-1.5 rounded">En Ağır: <span className="text-white">{entry.maxWeight}kg</span></div>
                                      <div className="text-xs text-slate-400 bg-slate-900/50 p-1.5 rounded">Yakalama: <span className="text-white">{entry.count}</span></div>
                                  </div>
                                  
                                  <div className="flex gap-2 mt-2">
                                      {entry.shinyCaught && <span className="text-[10px] text-cyan-400 bg-cyan-900/20 px-2 rounded border border-cyan-500/30">✨ Parlak</span>}
                                      {entry.goldenCaught && <span className="text-[10px] text-yellow-400 bg-yellow-900/20 px-2 rounded border border-yellow-500/30">🏆 Altın</span>}
                                  </div>
                              </div>
                          </div>
                      );
                  })()}
              </div>
          )}
      </Modal>

      <Modal isOpen={activeModal === 'slots'} onClose={() => setActiveModal(null)} title="Slot Makinesi">
          <div className="flex flex-col items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-center text-xs text-slate-400 mb-2">Şansını dene, servetini katla!</div>
              <div className="flex gap-2 p-4 bg-black rounded-lg border-4 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  {slotReels.map((symbol, idx) => (
                      <div key={idx} className={`w-16 h-20 bg-white rounded flex items-center justify-center text-4xl ${isSpinning ? 'animate-pulse blur-sm' : ''}`}>
                          {isSpinning ? '❓' : symbol}
                      </div>
                  ))}
              </div>
              {lastWin ? (
                  <div className="text-center animate-bounce">
                      <div className="text-2xl font-black text-yellow-400">{lastWin.amount} TL KAZANDIN!</div>
                      <div className="text-xs text-yellow-200 uppercase tracking-widest">{lastWin.type === 'jackpot' ? 'JACKPOT!!!' : lastWin.type === 'big' ? 'BÜYÜK ÖDÜL!' : 'KAZANÇ'}</div>
                  </div>
              ) : (
                  <div className="h-10 flex items-center justify-center text-slate-500 text-sm">{isSpinning ? 'Dönüyor...' : 'BAHİS YAP VE ÇEVİR'}</div>
              )}
              <div className="w-full space-y-2">
                  <div className="flex justify-center gap-2">
                      {[100, 500, 1000, 5000].map(amt => (
                          <button key={amt} onClick={() => setSlotBet(amt)} className={`px-3 py-1 rounded text-xs font-bold transition-all ${slotBet === amt ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>{amt}</button>
                      ))}
                  </div>
                  <button onClick={handleSlotSpin} disabled={isSpinning || stats.money < slotBet} className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-all active:scale-95 ${isSpinning || stats.money < slotBet ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:brightness-110 shadow-orange-900/50'}`}>{isSpinning ? '...' : 'ÇEVİR'}</button>
                  {stats.money < slotBet && <div className="text-center text-xs text-red-400">Yetersiz Bakiye</div>}
              </div>
          </div>
      </Modal>

      {activeEvent && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm pointer-events-none animate-slide-up">
              <div className="bg-slate-900/90 backdrop-blur border-y border-white/10 p-2 flex items-center justify-center gap-3 shadow-2xl">
                  <div className="text-2xl animate-bounce">⚡</div>
                  <div className="text-center">
                      <div className={`font-black text-sm uppercase tracking-widest ${activeEvent.color} animate-pulse`}>{activeEvent.name}</div>
                      <div className="text-[10px] text-slate-300 font-medium">{activeEvent.description}</div>
                  </div>
                  <div className="text-2xl animate-bounce">⚡</div>
              </div>
          </div>
      )}

      {duel.active && !duel.finished && (
          <div className="absolute top-20 inset-x-0 z-40 px-4 animate-slide-up">
              <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-3 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 rounded-b-lg px-3 py-1 font-mono text-xl font-black text-white shadow-lg z-10 border border-t-0 border-slate-600">
                      {duel.duration}s
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-4 mt-2">
                      <span className="text-blue-400">SİZ</span>
                      <span className="text-red-400">{RIVALS.find(r => r.id === duel.rivalId)?.name}</span>
                  </div>

                  <div className="relative w-full h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 z-10" />
                      
                      <div 
                          className="absolute top-0 bottom-0 left-0 bg-blue-600 transition-all duration-300 ease-out" 
                          style={{ width: `${Math.min(100, Math.max(0, 50 + ((duel.playerScore - duel.rivalScore) / 100) * 10))}%` }} 
                      />
                      <div 
                          className="absolute top-0 bottom-0 right-0 bg-red-600 transition-all duration-300 ease-out" 
                          style={{ width: `${Math.min(100, Math.max(0, 50 + ((duel.rivalScore - duel.playerScore) / 100) * 10))}%` }} 
                      />
                  </div>

                  <div className="flex justify-between items-center font-mono font-bold text-lg px-2">
                      <span className="text-blue-300">{duel.playerScore}</span>
                      <span className="text-red-300">{duel.rivalScore}</span>
                  </div>
                  
                  <button onClick={surrenderDuel} className="text-[10px] text-slate-500 hover:text-white underline text-center">Pes Et</button>
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
                <button onClick={cycleRadio} className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-blue-300 active:scale-95 transition">{radioStation === 'off' ? <Radio size={16} /> : radioStation === 'nature' ? <Waves size={16} /> : <Music size={16} />}</button>
                <button onClick={toggleMute} className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-slate-400 active:scale-95 transition">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-blue-600 border border-blue-400 rounded-full text-white active:scale-95 transition shadow-lg shadow-blue-900/50 animate-[pulse_3s_infinite]"><Menu size={16} /></button>
            </div>
            {Date.now() < buffs.xpBoostExpiry && (<div className="bg-purple-900/80 border border-purple-500/50 px-2 py-0.5 rounded text-[9px] text-purple-200 font-bold animate-pulse flex items-center gap-1"><Zap size={10} /> 2x XP ({Math.ceil((buffs.xpBoostExpiry - Date.now())/60000)}dk)</div>)}
            {buffs.goldenHook && (<div className="bg-yellow-900/80 border border-yellow-500/50 px-2 py-0.5 rounded text-[9px] text-yellow-200 font-bold animate-pulse flex items-center gap-1"><Anchor size={10} /> Altın İğne</div>)}
        </div>
      </div>

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
