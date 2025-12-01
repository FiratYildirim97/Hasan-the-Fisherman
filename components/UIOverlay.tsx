
import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, LOCATIONS, SKILLS, FISH_DB } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Clock, Target, Flame, Crown, TrendingUp } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ItemType } from '../types';

export const UIOverlay: React.FC = () => {
  const { 
    stats, bag, castRod, gameState, ownedRods, unlockedLocs, skills, 
    sellItem, sellAll, recycleJunk, buyItem, equipRod, repairRod, travel, quests, claimQuest, aquarium, moveToAqua, upgradeSkill, pedia,
    isMuted, toggleMute, lifetimeStats, getRank,
    combo, tournament, bounty, closeTournamentResult
  } = useGame();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getBagPercent = () => (bag.length / stats.bagLimit) * 100;
  const getXpPercent = () => (stats.xp / (stats.level * 300)) * 100;

  const junkCount = bag.filter(i => i.type === ItemType.JUNK).length;

  return (
    <>
      {/* HEADER */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-start z-30 pt-safe-top bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        {/* Level / XP */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur border border-slate-700 px-3 py-1 rounded-full text-sm font-bold text-white">
            <span className="text-blue-400">LVL {stats.level}</span>
            <span className="text-slate-500">|</span>
            <span>{stats.xp} / {stats.level * 300} XP</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${getXpPercent()}%` }} />
          </div>
        </div>

        {/* Money & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
           <div className="bg-slate-900/60 backdrop-blur border border-yellow-500/30 px-4 py-1.5 rounded-full font-mono font-bold text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            {stats.money.toLocaleString()} TL
           </div>
           
           <button 
             onClick={() => setActiveModal('career')}
             className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-amber-500 active:scale-95 transition"
           >
             <Trophy size={16} />
           </button>

           <button 
             onClick={toggleMute}
             className="p-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full text-slate-400 active:scale-95 transition"
           >
             {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
           </button>
        </div>
      </div>

      {/* --- COMPETITIVE WIDGETS --- */}
      
      {/* Tournament Active Widget */}
      {tournament.active && (
        <div className="absolute top-20 left-4 z-20 pointer-events-none animate-slide-in-left">
           <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] border-l-4 border-orange-500 w-40">
              <div className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-widest mb-1">
                 <Crown size={14} className="animate-bounce" /> Turnuva
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
                 <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 linear" style={{ width: `${(tournament.timeLeft / 60) * 100}%` }} />
              </div>

              <div className="flex justify-between items-end">
                  <div className="text-xl font-mono font-bold text-white leading-none">
                     {tournament.playerScore}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                     PUAN
                  </div>
              </div>
              
              <div className="text-[10px] text-orange-200/80 font-bold mt-1 text-center bg-orange-900/30 rounded py-0.5">
                 Kalan Süre: {tournament.timeLeft}s
              </div>
           </div>
        </div>
      )}

      {/* Bounty Widget */}
      {bounty.active && (
        <div className="absolute top-20 right-4 z-20 pointer-events-none animate-slide-in-right">
           <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] border-r-4 border-emerald-500 w-48 relative overflow-hidden">
              <div className="flex justify-between items-center mb-1 relative z-10">
                 <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1"><Target size={12}/> ARANIYOR</span>
                 <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 rounded">{Math.floor(bounty.timeLeft/60)}:{(bounty.timeLeft%60).toString().padStart(2,'0')}</span>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 mt-2">
                 {/* Fish Emoji Icon */}
                 <div className="text-3xl filter drop-shadow-md animate-pulse">
                    {FISH_DB[bounty.locId]?.find(f => f.name === bounty.fishName)?.emoji || '🐟'}
                 </div>
                 <div className="flex flex-col">
                    <div className="text-sm font-bold text-white leading-tight">
                       {bounty.fishName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                       {bounty.minWeight}kg+
                    </div>
                 </div>
              </div>

              <div className="text-[10px] text-slate-400 mt-2 relative z-10">
                 Konum: <span className={stats.locId === bounty.locId ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{LOCATIONS[bounty.locId].name}</span>
              </div>
              
              <div className="absolute right-0 bottom-0 p-2 opacity-10 text-emerald-500 rotate-12 transform translate-x-4 translate-y-4">
                 <Fish size={80} />
              </div>
           </div>
        </div>
      )}

      {/* Combo Widget */}
      {combo > 1 && (
         <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="flex flex-col items-center animate-[bounce_0.5s_infinite]">
               <div className="relative">
                  <div className="text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-400 via-fuchsia-500 to-indigo-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] transform -skew-x-12 z-10">
                     x{combo}
                  </div>
                  <div className="absolute inset-0 text-7xl font-black italic text-purple-900 blur-sm transform -skew-x-12 translate-y-2 -z-10">
                     x{combo}
                  </div>
               </div>
               
               <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-1 rounded-full border border-purple-500/50 mt-2 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <Flame size={16} className="text-orange-500 animate-fire" />
                  <span className="text-sm font-bold text-purple-200 uppercase tracking-widest">COMBO</span>
               </div>
               
               <div className="text-xs font-bold text-yellow-300 mt-1 drop-shadow-md">
                  +{Math.round(combo * 10)}% DEĞER BONUSU
               </div>
            </div>
         </div>
      )}


      {/* CONTROLS */}
      <div className="absolute bottom-0 w-full bg-slate-900/95 border-t border-slate-700 rounded-t-3xl shadow-2xl z-40 pb-safe-bottom">
        <div className="p-4">
          {/* Status Bar */}
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 px-2">
            <div className="flex items-center gap-2">
              <span>HP:</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stats.rodHp < 3 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${(stats.rodHp / RODS[stats.rodId].maxHp) * 100}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>YEM:</span>
              <span className={stats.baitId ? "text-emerald-400" : "text-slate-600"}>
                {stats.baitId ? BAITS.find(b => b.id === stats.baitId)?.name : "Yok"}
              </span>
            </div>
          </div>

          {/* Cast Button */}
          <button 
            onClick={castRod}
            disabled={gameState !== 'IDLE'}
            className={`w-full py-4 rounded-2xl text-xl font-black tracking-widest shadow-lg transition-all active:scale-95 mb-4 relative overflow-hidden
              ${gameState === 'IDLE' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/50 hover:brightness-110' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
            `}
          >
            {gameState === 'IDLE' ? 'OLTA AT' : 'BEKLENİYOR...'}
            {combo > 0 && gameState === 'IDLE' && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-200 bg-purple-900/80 px-2 py-1 rounded border border-purple-500/30 flex items-center gap-1">
                  <TrendingUp size={12} /> +{Math.round(combo*10)}%
               </div>
            )}
          </button>

          {/* Menu Grid */}
          <div className="grid grid-cols-5 gap-2">
             <MenuButton icon={<Briefcase size={20} />} label="Çanta" onClick={() => setActiveModal('bag')} badge={bag.length} badgeColor="bg-blue-500" />
             <MenuButton icon={<Fish size={20} />} label="Akvaryum" onClick={() => setActiveModal('aqua')} badge={aquarium.length} badgeColor="bg-cyan-500" />
             <MenuButton icon={<ScrollText size={20} />} label="Hedefler" onClick={() => setActiveModal('quests')} badge={quests.some(q => !q.claimed && q.current >= q.target) ? "!" : null} badgeColor="bg-yellow-500" />
             <MenuButton icon={<BookOpen size={20} />} label="Rehber" onClick={() => setActiveModal('pedia')} />
             <MenuButton icon={<ShoppingCart size={20} />} label="Market" onClick={() => setActiveModal('shop')} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
             <MenuButton icon={<Map size={20} />} label="Harita" onClick={() => setActiveModal('map')} wide />
             <MenuButton icon={<Anchor size={20} />} label="Yetenek" onClick={() => setActiveModal('skills')} wide />
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Tournament Result Modal */}
      <Modal isOpen={tournament.finished} onClose={closeTournamentResult} title="Turnuva Sonucu">
         <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-6xl animate-bounce">
               {tournament.rank === 1 ? '🏆' : tournament.rank === 2 ? '🥈' : tournament.rank === 3 ? '🥉' : '🎗️'}
            </div>
            <div>
               <div className="text-sm text-slate-400 uppercase font-bold">SIRALAMAN</div>
               <div className="text-4xl font-black text-white">{tournament.rank}.</div>
            </div>
            
            <div className="w-full bg-slate-800 rounded-xl overflow-hidden mt-4">
               <div className="p-3 bg-slate-900/50 font-bold text-xs text-slate-400 flex justify-between">
                  <span>İSİM</span>
                  <span>PUAN</span>
               </div>
               {/* Player Entry */}
               <div className="p-3 flex justify-between items-center bg-blue-900/30 border-l-4 border-blue-500">
                  <span className="font-bold text-blue-300">SEN</span>
                  <span className="font-mono text-white">{tournament.playerScore}</span>
               </div>
               {/* AI Entries (Sorted with Player) */}
               {(() => {
                  const combined = [
                     { name: 'SEN', score: tournament.playerScore, isMe: true },
                     ...tournament.aiScores.map(ai => ({ ...ai, isMe: false }))
                  ].sort((a,b) => b.score - a.score);
                  
                  return combined.map((entry, idx) => {
                     if (entry.isMe) return null; // Already shown above or handle differently
                     return (
                        <div key={idx} className="p-3 flex justify-between items-center border-b border-slate-700/50">
                           <span className="text-slate-300">{entry.name}</span>
                           <span className="font-mono text-slate-400">{entry.score}</span>
                        </div>
                     )
                  })
               })()}
            </div>
            
            <button onClick={closeTournamentResult} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">KAPAT</button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'career'} onClose={() => setActiveModal(null)} title="Kariyer">
        <div className="flex flex-col items-center p-4 bg-slate-800 rounded-xl mb-4">
           <div className="text-4xl mb-2">🏆</div>
           <div className="text-sm text-slate-400 uppercase tracking-widest font-bold">Rütbe</div>
           <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
             {getRank()}
           </div>
        </div>
        
        <div className="space-y-3">
           <StatRow icon={<Fish size={18} className="text-blue-400" />} label="Toplam Yakalanan" value={lifetimeStats.totalCaught} />
           <StatRow icon={<Target size={18} className="text-red-400" />} label="Efsanevi Balık" value={lifetimeStats.legendariesCaught} />
           <StatRow icon={<Anchor size={18} className="text-slate-400" />} label="En Ağır Balık" value={`${lifetimeStats.heaviestFish} kg`} />
           <StatRow icon={<div className="text-yellow-400 font-bold text-xs">TL</div>} label="Toplam Kazanç" value={lifetimeStats.totalMoneyEarned.toLocaleString()} />
           <StatRow icon={<Clock size={18} className="text-green-400" />} label="Oynama Süresi" value={`${Math.floor(lifetimeStats.playTimeMinutes / 60)}s ${lifetimeStats.playTimeMinutes % 60}dk`} />
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'bag'} onClose={() => setActiveModal(null)} title="Sırt Çantası">
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="text-slate-400 text-sm">{bag.length} / {stats.bagLimit} Eşya</div>
          <div className="flex gap-2">
             {junkCount >= 5 && (
                <button 
                  onClick={recycleJunk} 
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-600 border border-emerald-500"
                  title="5 Çöp karşılığı 1 Yem"
                >
                   <Recycle size={12} /> 5 ÇÖP = YEM
                </button>
             )}
             <button onClick={sellAll} className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded hover:bg-yellow-500">TÜMÜNÜ SAT</button>
          </div>
        </div>
        {bag.length === 0 && <div className="text-center py-8 text-slate-500">Çantanız boş.</div>}
        <div className="space-y-2">
           {bag.map(item => (
             <div key={item.id} className={`flex justify-between items-center p-3 border rounded-xl ${item.type === ItemType.JUNK ? 'bg-slate-800/30 border-slate-800 opacity-75' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">{item.emoji} {item.name}</span>
                  <span className="text-xs text-slate-500">
                    {item.type === ItemType.JUNK ? 'Çöp' : `${item.weight} kg`} • <span className="text-yellow-500">{Math.floor(item.value * (1 + (skills.haggle||0)*0.1))} TL</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  {item.type !== ItemType.JUNK && (
                    <button onClick={() => moveToAqua(item.id)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition">
                      <Fish size={14} />
                    </button>
                  )}
                  <button onClick={() => sellItem(item.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500">SAT</button>
                </div>
             </div>
           ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'shop'} onClose={() => setActiveModal(null)} title="Market">
        <div className="space-y-6">
           <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Ekipman</h3>
             <div className="flex justify-between items-center p-3 bg-slate-800 rounded-xl mb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Olta Tamiri</span>
                  <span className="text-xs text-slate-400">Mevcut HP: {Math.ceil(stats.rodHp)}</span>
                </div>
                <button onClick={repairRod} className="px-4 py-2 bg-blue-600 rounded-lg font-bold text-sm">50 TL</button>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-800 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Çanta Yükseltme (+5)</span>
                  <span className="text-xs text-slate-400">Limit: {stats.bagLimit}</span>
                </div>
                <button onClick={() => buyItem('upgrade', 'bag')} className="px-4 py-2 bg-purple-600 rounded-lg font-bold text-sm">500 TL</button>
             </div>
           </section>

           <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Yemler</h3>
             <div className="grid grid-cols-1 gap-2">
               {BAITS.map(bait => (
                 <div key={bait.id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                   <div>
                     <div className="font-bold text-emerald-400">{bait.name}</div>
                     <div className="text-xs text-slate-500">Şans x{bait.bonus}</div>
                   </div>
                   <button onClick={() => buyItem('bait', bait.id)} className="px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-600">{bait.price} TL</button>
                 </div>
               ))}
             </div>
           </section>
           
           <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Oltalar</h3>
             <div className="space-y-2">
               {RODS.map(rod => {
                 const isOwned = ownedRods.includes(rod.id);
                 const isEquipped = stats.rodId === rod.id;
                 return (
                   <div key={rod.id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                     <div>
                       <div className="font-bold" style={{ color: rod.color }}>{rod.name}</div>
                       <div className="text-xs text-slate-500">Güç: {rod.power} • HP: {rod.maxHp}</div>
                     </div>
                     {isOwned ? (
                       <button 
                         onClick={() => equipRod(rod.id)}
                         disabled={isEquipped}
                         className={`px-3 py-1.5 text-xs font-bold rounded-lg ${isEquipped ? 'bg-green-500/20 text-green-500' : 'bg-slate-600 text-white'}`}
                       >
                         {isEquipped ? 'KUŞANDI' : 'KUŞAN'}
                       </button>
                     ) : (
                       <button onClick={() => buyItem('rod', rod.id)} className="px-3 py-1.5 bg-yellow-600 text-black text-xs font-bold rounded-lg hover:bg-yellow-500">{rod.price.toLocaleString()} TL</button>
                     )}
                   </div>
                 );
               })}
             </div>
           </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'map'} onClose={() => setActiveModal(null)} title="Lokasyonlar">
         <div className="space-y-2">
           {LOCATIONS.map(loc => {
             const isUnlocked = unlockedLocs.includes(loc.id);
             const isCurrent = stats.locId === loc.id;
             return (
               <div key={loc.id} className={`flex justify-between items-center p-4 rounded-xl border ${isCurrent ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{loc.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{loc.name}</span>
                      {!isUnlocked && <span className="text-xs text-yellow-500">{loc.price.toLocaleString()} TL</span>}
                    </div>
                  </div>
                  {isUnlocked ? (
                    <button 
                      onClick={() => travel(loc.id)} 
                      disabled={isCurrent}
                      className={`px-4 py-2 text-xs font-bold rounded-lg ${isCurrent ? 'text-slate-500' : 'bg-blue-600 text-white'}`}
                    >
                      {isCurrent ? 'BURADASIN' : 'GİT'}
                    </button>
                  ) : (
                    <button onClick={() => buyItem('location', loc.id)} className="px-4 py-2 bg-yellow-600 text-black text-xs font-bold rounded-lg hover:bg-yellow-500">KİLİDİ AÇ</button>
                  )}
               </div>
             )
           })}
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'aqua'} onClose={() => setActiveModal(null)} title="Akvaryum">
         <div className="mb-4 text-center p-3 bg-slate-800 rounded-xl">
           <div className="text-xs text-slate-400">Pasif Gelir</div>
           <div className="text-xl font-bold text-yellow-400">
             {aquarium.reduce((acc, f) => acc + (f.rarity > 1 ? f.rarity * 5 : 2), 0)} TL <span className="text-xs text-slate-500">/ dk</span>
           </div>
           <div className="text-xs text-slate-500 mt-1">Kapasite: {aquarium.length} / {stats.aquaLimit}</div>
         </div>
         
         {/* Visual Aquarium Tank */}
         <div className="h-32 bg-gradient-to-b from-cyan-900/50 to-blue-900/50 rounded-xl border border-blue-500/30 mb-4 relative overflow-hidden">
            {aquarium.map((f, i) => (
              <div 
                key={i} 
                className="absolute text-2xl animate-float transition-all duration-1000"
                style={{ 
                  left: `${(i * 15) % 90}%`, 
                  top: `${20 + (i * 10) % 60}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                {f.emoji}
              </div>
            ))}
         </div>

         <div className="space-y-2">
            {aquarium.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{item.emoji} {item.name}</span>
                    <span className="text-xs text-slate-500">{item.weight} kg</span>
                 </div>
                 <button onClick={() => sellItem(item.id, true)} className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white border border-red-600/30">
                    SAT ({item.value} TL)
                 </button>
              </div>
            ))}
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'quests'} onClose={() => setActiveModal(null)} title="Hedefler">
         <div className="space-y-3">
           {quests.every(q => q.claimed) ? (
             <div className="text-center py-8 text-slate-500">
               <div className="mb-2">Tüm hedefler tamamlandı!</div>
               <div className="text-xs">Yeni görevler için biraz balık tut.</div>
             </div>
           ) : (
             quests.map((q, i) => {
               if(q.claimed) return null;
               const progress = Math.min(100, (q.current / q.target) * 100);
               return (
                 <div key={q.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-200">{q.desc}</span>
                      <span className="text-xs text-yellow-500">{q.reward} TL</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {progress >= 100 ? (
                        <button onClick={() => claimQuest(i)} className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded animate-pulse">AL</button>
                      ) : (
                        <span className="text-xs text-slate-400">{q.current}/{q.target}</span>
                      )}
                    </div>
                 </div>
               )
             })
           )}
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'pedia'} onClose={() => setActiveModal(null)} title="Balık Rehberi">
        <div className="grid grid-cols-4 gap-3">
          {Object.values(FISH_DB).flat().filter(f => f.type !== ItemType.JUNK).map(fish => {
            const entry = pedia[fish.name];
            return (
              <div key={fish.name} className={`aspect-square flex flex-col items-center justify-center rounded-xl border ${entry ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                <div className="text-3xl mb-1">{entry ? fish.emoji : '?'}</div>
                {entry && <div className="text-[10px] text-slate-400 text-center leading-tight">{fish.name}<br/><span className="text-yellow-500">{entry.maxWeight}kg</span></div>}
              </div>
            )
          })}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'skills'} onClose={() => setActiveModal(null)} title="Yetenekler">
         <div className="space-y-4">
           {SKILLS.map(skill => {
             const level = skills[skill.id] || 0;
             const cost = (level + 1) * 500;
             const isMax = level >= skill.max;
             const isLocked = stats.level < skill.reqLvl;

             return (
               <div key={skill.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="font-bold text-white">{skill.name} <span className="text-blue-400 text-sm">Lv.{level}</span></h4>
                     <p className="text-xs text-slate-400">{skill.desc}</p>
                   </div>
                   {!isMax && (
                     <button 
                       onClick={() => upgradeSkill(skill.id)}
                       disabled={isLocked}
                       className={`px-3 py-1 text-xs font-bold rounded ${isLocked ? 'bg-slate-700 text-slate-500' : 'bg-purple-600 text-white'}`}
                     >
                       {isLocked ? `Req Lv.${skill.reqLvl}` : `${cost} TL`}
                     </button>
                   )}
                   {isMax && <span className="text-xs font-bold text-emerald-500">MAX</span>}
                 </div>
                 {/* Upgrade Dots */}
                 <div className="flex gap-1">
                   {Array.from({length: skill.max}).map((_, i) => (
                     <div key={i} className={`h-1.5 flex-1 rounded-full ${i < level ? 'bg-purple-500' : 'bg-slate-700'}`} />
                   ))}
                 </div>
               </div>
             )
           })}
         </div>
      </Modal>
    </>
  );
};

// Helper Components
const StatRow: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="flex justify-between items-center p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
     <div className="flex items-center gap-3">
       {icon}
       <span className="text-sm text-slate-300 font-bold">{label}</span>
     </div>
     <span className="font-mono text-white">{value}</span>
  </div>
);

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, badge?: string | number | null, badgeColor?: string, wide?: boolean }> = ({ icon, label, onClick, badge, badgeColor, wide }) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-2 bg-slate-800/80 rounded-xl border border-white/5 active:scale-95 transition ${wide ? 'flex-row gap-2 py-3' : ''}`}
  >
    <div className="text-slate-300">{icon}</div>
    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{label}</span>
    {badge && (
      <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-slate-900 ${badgeColor || 'bg-red-500'}`}>
        {badge}
      </div>
    )}
  </button>
);
