import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../GameContext';
import { RODS, BAITS, BOBBERS, DECORATIONS, CHARMS, SKILLS, LOCATIONS, FISH_DB, ACHIEVEMENTS, PETS, PRESTIGE_UPGRADES, CRAFTING_RECIPES, RIVALS, LEAGUES, WHEEL_REWARDS } from '../constants';
import { Briefcase, ShoppingCart, Map, BookOpen, ScrollText, Anchor, Settings, X, Fish, Recycle, Volume2, VolumeX, Trophy, Crown, Target, TrendingUp, Sparkles, Droplets, Zap, Utensils, RefreshCw, Landmark, SlidersHorizontal, ArrowUpDown, Bell, Waves, PawPrint, Star, Hammer, Gem, Radio, Music, Dices, CalendarCheck, Menu, ChefHat, ShoppingBag, Store, Info, HandHeart, Swords, Moon, Scale, Trash2, Siren, Shovel } from 'lucide-react';
import { Modal } from './Modal';
import { ItemType, CatchItem, FishVisual, GameState } from '../types';
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

interface SidebarBtnProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    badge?: string | number;
}

const SidebarBtn = ({ icon, label, onClick, badge }: SidebarBtnProps) => (
    <button 
        onClick={() => { 
            setTimeout(() => onClick(), 0); 
        }} 
        className="w-full flex items-center gap-4 p-3 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group mb-2 active:scale-95"
    >
        <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>
        <div className="font-bold text-slate-200 text-sm flex-1 text-left">{label}</div>
        {badge && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</div>}
    </button>
);

// New Component for Animated Fish in Aquarium - Memoized to prevent re-renders
const SwimmingFish = React.memo(({ item }: { item: CatchItem }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});
    
    useEffect(() => {
        const duration = 10 + Math.random() * 15;
        const delay = -Math.random() * 20;
        const top = 10 + Math.random() * 70;
        
        setStyle({
            position: 'absolute',
            top: `${top}%`,
            width: '60px',
            height: '60px',
            animation: `swim ${duration}s linear ${delay}s infinite`,
            zIndex: Math.floor(top)
        });
    }, []);

    return (
        <div style={style} className="pointer-events-none drop-shadow-md">
            <FishRenderer visual={item.visual} />
            <style>{`
                @keyframes swim {
                    0% { left: -100px; transform: scaleX(1); }
                    49% { transform: scaleX(1); }
                    50% { left: calc(100% + 50px); transform: scaleX(-1); }
                    99% { transform: scaleX(-1); }
                    100% { left: -100px; transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
});

// Memoized Grid Cell to prevent full grid re-renders
const GridCell = React.memo(({ 
    idx, 
    cell, 
    huntResult, 
    onDig, 
    disabled 
}: { 
    idx: number, 
    cell: 'dug' | null, 
    huntResult: string | null, 
    onDig: (idx: number) => void,
    disabled: boolean
}) => {
    return (
        <button
            onClick={() => onDig(idx)}
            disabled={disabled}
            className={`w-20 h-20 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 transform 
                ${cell === null ? 'bg-[#8d6e63] hover:bg-[#a1887f] shadow-[inset_0_-4px_0_rgba(0,0,0,0.3)] active:scale-95' : 'bg-[#4e342e] shadow-inner'}
            `}
        >
            {cell === null ? '❌' : (
                huntResult === 'BOOM' && cell === 'dug' ? '💣' : '💎'
            )}
        </button>
    );
});

export const UIOverlay: React.FC = () => {
    const {
        stats, bag, castRod, gameState, ownedRods, ownedBobbers, ownedDecor, activeDecor, unlockedLocs, skills, achievements, dailyFortune,
        sellItem, sellAll, recycleJunk, buyItem, equipRod, equipBobber, toggleDecor, repairRod, travel, quests, claimQuest, aquarium, moveToAqua, upgradeSkill, pedia,
        isMuted, toggleMute, lifetimeStats, getRank,
        combo, tournament, bounty, closeTournamentResult, filterExpiry, cleanAquarium,
        marketTrend, marketMultipliers, rodMastery, activeDiscount,
        ecologyScore, buffs, visitorTip, collectVisitorTip, rerollFortune, cookFish,
        autoNetLevel, ownedCharms, mapParts, spinAvailable, settings, newsTicker, bankDeposit, bankWithdraw, upgradeAutoNet, upgradeWormFarm, spinWheel, toggleSetting, collectOfflineEarnings, offlineEarningsModal,
        museumStars, totalVisitors,
        startDiving, ownedPets, buyPet, feedPet,
        prestigeUpgrades, doPrestige, buyPrestigeUpgrade, calculatePrestigePearls,
        donateFish, craftItem, useItem,
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

    const [duelAcceptance, setDuelAcceptance] = useState<{ rivalId: string; name: string; icon: string } | null>(null);

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
        const targetAngle = 360 * 5 + (360 - (winningIndex * segmentAngle) - (segmentAngle / 2));
        setWheelRotation(prev => prev + targetAngle);
        setTimeout(() => { setIsWheelSpinning(false); }, 3000);
    };

    const handleSlotSpin = () => {
        if (stats.money < slotBet) return;
        setIsSpinning(true); setLastWin(null); setSlotReels(['❓', '❓', '❓']);
        setTimeout(() => { const { result, reward, winType } = playSlotMachine(slotBet); setSlotReels(result); setIsSpinning(false); if (reward > 0) setLastWin({ amount: reward, type: winType }); }, 1000);
    };

    const initTreasureHunt = useCallback(() => {
        startTreasureHunt();
        setGrid(Array(9).fill(null));
        setDigsLeft(3);
        setHuntResult(null);
        setIsHunting(true);
    }, [startTreasureHunt]);

    const handleDig = useCallback((idx: number) => {
        if (digsLeft <= 0 || grid[idx] === 'dug' || huntResult === 'BOOM') return;

        const result = digTreasure(idx);
        setGrid(prev => {
            const next = [...prev];
            next[idx] = 'dug';
            return next;
        });
        setDigsLeft(prev => prev - 1);

        if (result.found === 'trap') {
            setHuntResult('BOOM');
        }
    }, [digsLeft, grid, huntResult, digTreasure]);

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
                        <div className="font-bold text-sm text-slate-200 flex items-center gap-1">
                            {item.name}
                            {item.type === ItemType.FISH && pedia[item.name]?.maxWeight === item.weight && <span title="Kişisel Rekor Büyük!" className="text-yellow-400">👑</span>}
                            {item.golden && <span className="text-[9px] bg-yellow-500 text-black px-1 rounded font-black">ALTIN</span>}
                            {item.shiny && !item.golden && <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">PARLAK</span>}
                        </div>
                        <div className="text-xs text-slate-400">{item.type !== ItemType.JUNK ? <span className="flex items-center gap-1">{isCrafted ? 'Özel Eşya' : `${item.weight} kg`} • <span className={marketTrend?.fishName === item.name ? "text-green-400 font-bold" : "text-yellow-400"}> {dynamicValue} TL</span></span> : 'Değersiz'}</div>
                    </div>
                </div>
                <div className="flex gap-1">
                    {isCrafted && (<button onClick={() => useItem(item.id)} className="px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">Kullan</button>)}
                    {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => cookFish(item.id)} className="p-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-900" title="Ye"><Utensils size={14} /></button>}
                    {item.type !== ItemType.JUNK && !item.name.includes('İnci') && !isCrafted && <button onClick={() => moveToAqua(item.id)} className="p-2 bg-cyan-900/50 text-cyan-400 rounded-lg hover:bg-cyan-900"><Fish size={14} /></button>}
                    <button onClick={() => sellItem(item.id)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-600/30">Sat</button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col font-sans select-none">
            {/* --- PREMIUM HEADER (CLUTTER REDUCED) --- */}
            <div className="w-full bg-gradient-to-b from-slate-900/90 to-transparent p-4 pb-12 flex justify-between items-start pointer-events-auto">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/20">
                                <Anchor size={24} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 text-[10px] font-black px-1.5 rounded-full border-2 border-slate-900">
                                {stats.level}
                            </div>
                        </div>
                        <div>
                            <div className="text-white font-black text-sm tracking-wide uppercase">HASAN KAPTAN</div>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${getXpPercent()}%` }} />
                                </div>
                                <span className="text-[10px] text-cyan-400 font-bold">{Math.floor(getXpPercent())}%</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Secondary Stats Bar (Auto-hiding/Minimal) */}
                    <div className="flex gap-2 mt-2">
                        <div className="px-2 py-0.5 bg-slate-800/60 rounded-full border border-white/5 flex items-center gap-1.5">
                            <Droplets size={10} className="text-blue-400" />
                            <span className="text-[9px] text-slate-300 font-bold">{Math.ceil(stats.rodHp)}/{RODS[stats.rodId].maxHp}</span>
                        </div>
                        {stats.prestigeLevel > 0 && (
                            <div className="px-2 py-0.5 bg-fuchsia-900/40 rounded-full border border-fuchsia-500/20 flex items-center gap-1.5">
                                <Star size={10} className="text-fuchsia-400" />
                                <span className="text-[9px] text-fuchsia-200 font-bold">★{stats.prestigeLevel}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <div onClick={() => setActiveModal('bank')} className="group flex items-center gap-2 bg-slate-900/80 border border-yellow-500/30 px-4 py-2 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all shadow-xl">
                            <Gem size={16} className="text-yellow-500 animate-pulse" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-yellow-500/60 font-bold leading-none">BAKİYE</span>
                                <span className="text-lg font-mono font-black text-yellow-500 leading-none">{stats.money.toLocaleString()} <span className="text-xs">TL</span></span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }} 
                            className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all active:scale-90 shadow-xl group pointer-events-auto"
                        >
                            <Menu size={24} className="group-hover:rotate-90 transition-transform duration-300 pointer-events-none" />
                        </button>
                    </div>
                    
                    {/* Active Buffs (Floating Icons) */}
                    <div className="flex gap-1.5">
                        {Date.now() < buffs.xpBoostExpiry && <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center animate-bounce shadow-lg shadow-purple-500/50"><Zap size={14} className="text-white" /></div>}
                        {buffs.goldenHook && <div className="w-6 h-6 rounded-lg bg-yellow-500 flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/50"><Anchor size={14} className="text-slate-900" /></div>}
                        {marketTrend && <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50"><TrendingUp size={14} className="text-white" /></div>}
                    </div>
                </div>
            </div>

            {/* --- NEWS HUB (MODERN MARQUEE) --- */}
            <div className="w-full flex justify-center py-2">
                <div className="max-w-[80%] px-4 py-1.5 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-full overflow-hidden shadow-2xl flex items-center gap-3">
                    <Radio size={12} className="text-cyan-400 animate-pulse flex-shrink-0" />
                    <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] text-[11px] font-bold text-slate-300 tracking-wide pointer-events-auto cursor-help" onClick={() => setActiveModal('quests')}>
                        {newsTicker} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🌊 HASAN THE FISHERMAN: OFFLINE EDITION &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏆 LİGTE YÜKSELEREK ÖDÜLLERİ TOPLA &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
                    </div>
                </div>
            </div>

            {/* --- GAMEPLAY CENTER (EMPTY FOR FOCUS) --- */}
            <div className="flex-1 relative">
                {/* Combo & Duel UI stays here but more subtle */}
                {combo > 1 && (
                    <div className="absolute top-10 right-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-yellow-500 text-slate-900 px-4 py-1 rounded-xl font-black italic shadow-lg shadow-yellow-500/20 flex items-center gap-2">
                            <span className="text-xs">COMBO</span>
                            <span className="text-xl">{combo}x</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODERN CONTROL PANEL --- */}
            <div className="w-full bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent p-6 pb-safe-bottom pointer-events-auto">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    {/* Equipment Quick-View */}
                    <div className="hidden sm:flex flex-col gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500" title="Yem">
                            {stats.baitId ? <span className="text-lg">🦐</span> : <Droplets size={20} />}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500" title="Bot">
                             <Map size={20} />
                        </div>
                    </div>

                    {/* Main Interaction Area */}
                    <div className="flex-1 relative group">
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 ${gameState === GameState.BITE ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        
                        <button
                            onClick={gameState === GameState.BITE ? hookFish : castRod}
                            disabled={gameState !== GameState.IDLE && gameState !== GameState.BITE}
                            className={`relative w-full h-20 rounded-3xl font-black text-2xl tracking-[0.3em] flex items-center justify-center transition-all duration-300 active:scale-[0.98] border-t border-white/20 shadow-2xl overflow-hidden ${
                                gameState === GameState.BITE 
                                ? 'bg-gradient-to-b from-red-500 to-red-700 text-white animate-pulse' 
                                : gameState === GameState.IDLE 
                                ? 'bg-gradient-to-b from-blue-600 to-indigo-800 text-white' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {gameState === GameState.IDLE && <Droplets size={24} className="animate-bounce" />}
                                {gameState === GameState.BITE && <Zap size={24} className="animate-spin" />}
                                {gameState === GameState.IDLE ? 'RASTGELE' : gameState === GameState.BITE ? 'YAKALA!' : '...'}
                            </div>
                            
                            {/* Inner shine effect */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-col gap-2">
                         <button 
                            onClick={toggleMute} 
                            className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>
                </div>
                
                {/* Location Footer */}
                <div className="mt-4 text-center">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/5">
                        📍 {LOCATIONS.find(l => l.id === stats.locId)?.name}
                    </span>
                </div>
            </div>

            {/* --- MODALS & SIDEBAR --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto cursor-pointer" 
                    onClick={() => setIsSidebarOpen(false)} 
                />
            )}
            <div className={`fixed inset-y-0 right-0 z-[70] w-80 bg-slate-900 border-l border-white/5 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col pointer-events-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
                    <span className="font-black text-xl text-white tracking-wider flex items-center gap-2"><Anchor size={20} className="text-cyan-400" /> MENÜ</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }} 
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white active:scale-95 pointer-events-auto"
                    >
                        <X size={20} className="pointer-events-none" />
                    </button>
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
                        <SidebarBtn icon={<Map size={20} />} label="Harita & Keşif" onClick={() => { setActiveModal('map'); setIsSidebarOpen(false); }} />
                        <SidebarBtn icon={<BookOpen size={20} />} label="Ansiklopedi (Pedia)" onClick={() => { setActiveModal('pedia'); setIsSidebarOpen(false); }} />
                        <SidebarBtn icon={<Landmark size={20} />} label="Müze (Akvaryum)" onClick={() => { setActiveModal('aqua'); setIsSidebarOpen(false); }} />
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
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pointer-events-auto">
                                    {LOCATIONS.map(loc => {
                                        const isUnlocked = unlockedLocs.includes(loc.id);
                                        const isCurrent = stats.locId === loc.id;
                                        const locPedia = pedia[loc.name];

                                        if (!isUnlocked && loc.id > Math.max(...unlockedLocs) + 5) return null;

                                        return (
                                            <div 
                                                key={loc.id} 
                                                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                                                    isCurrent ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
                                                    isUnlocked ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500' : 
                                                    'bg-slate-900 border-slate-800 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`text-3xl w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-slate-900' : 'bg-slate-950 grayscale'}`}>
                                                        {loc.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-100 tracking-tight">{loc.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{loc.biome} Biyomu</div>
                                                        {isUnlocked && locPedia && (
                                                            <div className="flex gap-1.5 mt-1">
                                                                {locPedia.shinyCaught && <span title="Parlak" className="text-xs animate-pulse">✨</span>}
                                                                {locPedia.goldenCaught && <span title="Altın" className="text-xs">🟡</span>}
                                                                {locPedia.bestCrown && (
                                                                    <span className="text-[11px]">{locPedia.bestCrown === 'gold' ? '👑' : locPedia.bestCrown === 'silver' ? '🥈' : '🥉'}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {isCurrent ? (
                                                        <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">BURADASIN</span>
                                                    ) : isUnlocked ? (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); travel(loc.id); setActiveModal(null); }} 
                                                            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black transition-all active:scale-90 shadow-lg"
                                                        >
                                                            GİT
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); buyItem('location', loc.id); }} 
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all active:scale-90 shadow-lg"
                                                        >
                                                            {loc.price.toLocaleString()} TL
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="text-center py-4 text-[10px] text-slate-600 font-bold tracking-widest uppercase">
                                        Daha Fazla Bölge İçin Seviye Atla
                                    </div>
                                </div>
                            </Section>
                        </>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in">
                            <div className="flex justify-between w-full mb-4 px-2">
                                <button onClick={() => setIsHunting(false)} className="text-xs text-slate-400 underline">Geri Dön</button>
                                <div className="text-yellow-400 font-bold flex items-center gap-1"><Shovel size={16} /> {digsLeft} Hakkın Kaldı</div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 bg-[#3d342b] p-4 rounded-xl shadow-2xl border-4 border-[#5d4037]">
                                {grid.map((cell, idx) => (
                                    <GridCell 
                                        key={idx}
                                        idx={idx}
                                        cell={cell}
                                        huntResult={huntResult}
                                        onDig={handleDig}
                                        disabled={cell !== null || digsLeft === 0 || huntResult === 'BOOM'}
                                    />
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

            <Modal isOpen={activeModal === 'duels'} onClose={() => setActiveModal(null)} title="Rekabet (Lig) & Düellolar">
                <div className="space-y-6">
                    <Section title="Mevcut Lig Durumu">
                        <div className="bg-slate-800 p-4 rounded-xl border border-cyan-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">{[...LEAGUES].reverse().find(l => stats.leaguePoints >= l.minLP)?.icon || '🥉'}</div>
                                <div>
                                    <div className="text-white font-bold">{[...LEAGUES].reverse().find(l => stats.leaguePoints >= l.minLP)?.name || 'Lig Yok'}</div>
                                    <div className="text-xs text-slate-400 mt-1">Lig Puanı: <span className="font-mono text-cyan-400 font-bold">{Math.floor(stats.leaguePoints)} LP</span></div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Meydan Oku (Lokal Düello)">
                        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                            {RIVALS.map(rival => {
                                const isReady = stats.leaguePoints >= (LEAGUES.find(l => l.id === rival.minLeague)?.minLP || 0);
                                return (
                                    <div key={rival.id} className={`p-3 rounded-xl border flex items-center justify-between ${isReady ? 'bg-slate-800/80 border-red-900/50' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center border border-slate-700">{rival.icon}</div>
                                            <div>
                                                <div className="font-bold text-slate-200">{rival.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{rival.title} • {LEAGUES.find(l => l.id === rival.minLeague)?.name} Ligi</div>
                                            </div>
                                        </div>
                                        {isReady ? (
                                            <button 
                                                onClick={() => { startDuel(rival.id); setActiveModal(null); }} 
                                                className="px-3 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-200 rounded-lg text-xs font-bold border border-red-700/50 flex items-center gap-1 transition-all active:scale-95"
                                            >
                                                <Swords size={14} /> MEYDAN OKU
                                            </button>
                                        ) : (
                                            <div className="text-[10px] font-bold text-slate-500 text-center px-2 leading-tight">YETERSİZ<br/>LP</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'bag'} onClose={() => setActiveModal(null)} title="Sırt Çantası">
                <div className="flex justify-between items-center mb-4 bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase">Kapasite</div>
                    <div className={`font-mono font-bold ${bag.length >= stats.bagLimit ? 'text-red-400' : 'text-green-400'}`}>
                        {bag.length} / {stats.bagLimit}
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <button onClick={sellAll} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-green-900/30">TÜMÜNÜ SAT</button>
                    <button onClick={recycleJunk} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow-lg">ÇÖPLERİ DÖNÜŞTÜR</button>
                </div>
                <div className="space-y-2">
                    {bag.length === 0 && <div className="text-center py-10 text-slate-500">Çanta boş.</div>}
                    {sortedBag.map(item => renderBagItem(item))}
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'shop'} onClose={() => setActiveModal(null)} title="Market">
                <div className="space-y-6">
                    {activeDiscount && <div className="p-3 bg-green-900/40 border border-green-500/50 rounded-xl text-green-400 text-xs font-bold text-center animate-pulse">🎉 EVCİL HAYVAN İNDİRİMİ AKTİF!</div>}

                    <Section title="Oltalar">
                        {RODS.map(rod => (
                            <ShopItem
                                key={rod.id}
                                title={rod.name}
                                desc={`Güç: ${rod.power} | Dayanıklılık: ${rod.maxHp}`}
                                price={rod.price}
                                owned={ownedRods.includes(rod.id)}
                                equipped={stats.rodId === rod.id}
                                onBuy={() => buyItem('rod', rod.id)}
                                onEquip={() => equipRod(rod.id)}
                                color={rod.color}
                            />
                        ))}
                    </Section>

                    <Section title="Yemler">
                        {BAITS.map(bait => (
                            <ShopItem
                                key={bait.id}
                                title={bait.name}
                                desc={`Bonus: x${bait.bonus}`}
                                price={bait.price}
                                onBuy={() => buyItem('bait', bait.id)}
                                active={stats.baitId === bait.id}
                            />
                        ))}
                    </Section>

                    <Section title="Şamandıralar">
                        {BOBBERS.map(bobber => (
                            <ShopItem
                                key={bobber.id}
                                title={bobber.name}
                                desc="Görsel Özelleştirme"
                                price={bobber.price}
                                owned={ownedBobbers.includes(bobber.id)}
                                equipped={stats.bobberId === bobber.id}
                                onBuy={() => buyItem('bobber', bobber.id)}
                                onEquip={() => equipBobber(bobber.id)}
                            />
                        ))}
                    </Section>

                    <Section title="Geliştirmeler">
                        <ShopItem title="Çanta Genişletme (+5)" desc="Daha fazla balık taşı." price={500} onBuy={() => buyItem('upgrade', 'bag')} />
                    </Section>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'quests'} onClose={() => setActiveModal(null)} title="Görevler">
                <div className="space-y-3">
                    {bounty.active && (
                        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex justify-between items-center animate-pulse">
                            <div>
                                <div className="text-red-400 font-black text-sm tracking-widest uppercase">WANTED</div>
                                <div className="text-white font-bold">{bounty.fishName} ({bounty.minWeight}kg+)</div>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-400 font-bold">{bounty.reward} TL</div>
                                <div className="text-xs text-red-400">{Math.floor(bounty.timeLeft)}s</div>
                            </div>
                        </div>
                    )}
                    {quests.map((q, i) => (
                        <div key={q.id} className={`p-4 rounded-xl border flex items-center justify-between ${q.claimed ? 'bg-slate-800/50 border-slate-700 opacity-50' : q.current >= q.target ? 'bg-green-900/20 border-green-500' : 'bg-slate-800 border-slate-700'}`}>
                            <div>
                                <div className="font-bold text-slate-200">{q.desc}</div>
                                <div className="text-xs text-slate-400 mt-1">İlerleme: {Math.floor(q.current)} / {q.target}</div>
                                <div className="w-24 h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(q.current / q.target) * 100}%` }} />
                                </div>
                            </div>
                            {q.claimed ? (
                                <span className="text-xs font-bold text-slate-500">ALINDI</span>
                            ) : q.current >= q.target ? (
                                <button onClick={() => claimQuest(i)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-xs animate-bounce">ÖDÜLÜ AL</button>
                            ) : (
                                <div className="text-xs font-bold text-yellow-400">{q.reward} TL</div>
                            )}
                        </div>
                    ))}
                    {quests.length === 0 && <div className="text-center text-slate-500">Yeni görevler için seyahat et.</div>}
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'aqua'} onClose={() => setActiveModal(null)} title={`Akvaryum (${aquarium.length}/${stats.aquaLimit})`}>
                <div className="space-y-4">
                    {/* Visual Tank Area */}
                    <div className="relative w-full h-64 bg-gradient-to-b from-cyan-400/20 to-blue-600/40 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-inner group">
                        {/* Tank Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50" />
                        
                        {/* Sand Bottom */}
                        <div className="absolute bottom-0 w-full h-8 bg-orange-200/40 blur-[2px]" />
                        
                        {/* Bubbles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="absolute bottom-[-20px] w-2 h-2 bg-white rounded-full animate-[floatUp_3s_linear_infinite]" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
                            ))}
                        </div>

                        {/* Swimming Fish */}
                        {aquarium.map(item => (
                            <SwimmingFish key={item.id} item={item} />
                        ))}
                        
                        {aquarium.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400/50 font-black italic tracking-widest text-xl rotate-[-5deg]">
                                <Fish size={48} className="mb-2 opacity-20" />
                                BOŞ TANK
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 text-center">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Müze Puanı</div>
                            <div className="text-yellow-400 font-black flex items-center justify-center gap-1">
                                {museumStars.toFixed(1)} <Star size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 text-center">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Ziyaretçi</div>
                            <div className="text-cyan-400 font-black">
                                {totalVisitors.toLocaleString()} 👤
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2">
                        <button onClick={cleanAquarium} className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                            <Sparkles size={16} /> {Date.now() < filterExpiry ? 'TEMİZ (Bonus Aktif)' : 'TEMİZLE (250 TL)'}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                        {aquarium.map((item: CatchItem) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-900/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-2xl relative overflow-hidden">
                                        <FishRenderer visual={item.visual} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-cyan-100 flex items-center gap-1">
                                            {item.name}
                                            {item.type === ItemType.FISH && pedia[item.name]?.maxWeight === item.weight && <span title="Kişisel Rekor Büyük!" className="text-yellow-400">👑</span>}
                                        </div>
                                        <div className="text-xs text-cyan-400/60">Değer artışı: +{(Date.now() < filterExpiry ? 20 : 5)}%</div>
                                        {item.crown && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm border ${
                                                    item.crown === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-300 animate-pulse' : 
                                                    item.crown === 'silver' ? 'bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900 border-slate-200' : 
                                                    'bg-gradient-to-r from-orange-700 to-orange-900 text-white border-orange-600'
                                                }`}>
                                                    {item.crown === 'gold' ? '🏆 ALTIN TAÇ' : item.crown === 'silver' ? '🥈 GÜMÜŞ TAÇ' : '🥉 BRONZ TAÇ'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => sellItem(item.id, true)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-600/30">SAT ({Math.floor(item.value * (Date.now() < filterExpiry ? 1.2 : 1.05))})</button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'skills'} onClose={() => setActiveModal(null)} title="Yetenekler">
                <div className="space-y-3">
                    {SKILLS.map(skill => {
                        const level = skills[skill.id] || 0;
                        const cost = (level + 1) * 500;
                        const isLocked = stats.level < skill.reqLvl;

                        return (
                            <div key={skill.id} className={`p-3 rounded-xl border ${isLocked ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-slate-200">{skill.name} <span className="text-blue-400 text-xs">Lvl {level}/{skill.max}</span></div>
                                        <div className="text-xs text-slate-400">{skill.desc}</div>
                                    </div>
                                    {!isLocked && level < skill.max && (
                                        <button onClick={() => upgradeSkill(skill.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">{cost} TL</button>
                                    )}
                                    {level >= skill.max && <span className="text-green-400 text-xs font-bold">MAX</span>}
                                    {isLocked && <span className="text-red-400 text-xs font-bold">Lvl {skill.reqLvl}+</span>}
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(level / skill.max) * 100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'pedia'} onClose={() => setActiveModal(null)} title="Balık Ansiklopedisi">
                <div className="grid grid-cols-4 gap-2">
                    {Object.values(FISH_DB).flat()
                        .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i && v.type === 'fish')
                        .map(fish => {
                            const entry = pedia[fish.name];
                            const isCaught = !!entry;
                            return (
                                <div key={fish.name}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${isCaught ? (entry.goldenCaught ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-slate-800 border-slate-700') : 'bg-slate-900 border-slate-800 opacity-50'}`}
                                    onClick={() => isCaught && setSelectedFish(fish.name)}
                                >
                                    <div className="text-2xl mb-1 relative">
                                        {isCaught ? fish.emoji : '❓'}
                                        {isCaught && entry.bestCrown === 'gold' && <div className="absolute -top-2 -right-2 text-[10px] animate-bounce">👑</div>}
                                    </div>
                                    {isCaught && entry.donated && <div className="absolute top-1 right-1 text-[8px] bg-purple-500 text-white px-1 rounded shadow-sm">MÜZE</div>}
                                </div>
                            );
                        })
                    }
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'crafting'} onClose={() => setActiveModal(null)} title="Zanaat Masası">
                <div className="space-y-4">
                    {CRAFTING_RECIPES.map(recipe => (
                        <div key={recipe.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                            <div className="font-bold text-slate-200 mb-1">{recipe.name}</div>
                            <div className="text-xs text-slate-400 mb-2">{recipe.desc}</div>
                            <div className="flex gap-2 mb-3">
                                {recipe.inputs.map((input, idx) => {
                                    const count = bag.filter(i => i.name === input.itemName).length;
                                    const hasEnough = count >= input.count;
                                    return (
                                        <div key={idx} className={`px-2 py-1 rounded text-xs font-mono border ${hasEnough ? 'bg-slate-900 border-slate-600 text-slate-300' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                                            {input.itemName}: {count}/{input.count}
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="w-full py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-white font-bold text-xs">ÜRET</button>
                        </div>
                    ))}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                        Çöpler ve materyaller burada işlenir.
                    </div>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'restaurant'} onClose={() => setActiveModal(null)} title="Hasan'ın Yeri">
                {!restaurant.isUnlocked ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">👨‍🍳</div>
                        <h3 className="text-xl font-bold text-white mb-2">Restoran Henüz Açılmadı</h3>
                        <p className="text-slate-400 text-sm mb-6">Kendi balık restoranını işletmek için seviye 5 ol ve 30.000 TL biriktir.</p>
                        <button
                            onClick={unlockRestaurant}
                            disabled={stats.money < 30000 || stats.level < 5}
                            className="px-8 py-3 bg-green-600 disabled:bg-slate-700 text-white rounded-xl font-bold"
                        >
                            SATIN AL (30.000 TL)
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setRestaurantTab('kitchen')} className={`flex-1 py-2 rounded-md text-xs font-bold ${restaurantTab === 'kitchen' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Mutfak</button>
                            <button onClick={() => setRestaurantTab('market')} className={`flex-1 py-2 rounded-md text-xs font-bold ${restaurantTab === 'market' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Tedarik</button>
                        </div>

                        {restaurantTab === 'kitchen' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                    <span>Müşteriler: {activeCustomers.length}/3</span>
                                    <span>İtibar: {restaurant.reputation}</span>
                                </div>
                                {activeCustomers.length === 0 && <div className="text-center py-6 text-slate-500">Müşteri bekleniyor...</div>}
                                {activeCustomers.map(customer => (
                                    <div key={customer.id} className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-white">{customer.name}</span>
                                            <span className="text-xs text-yellow-400 font-bold">{customer.reward} TL</span>
                                        </div>
                                        <div className="text-xs text-slate-300 mb-3">
                                            İstek: {customer.fishReq.rarity} seviye üzeri, {customer.fishReq.minWeight}kg+ balık
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {bag.filter(f => f.type === 'fish' && f.rarity >= customer.fishReq.rarity && f.weight >= customer.fishReq.minWeight).slice(0, 4).map(fish => (
                                                <button key={fish.id} onClick={() => serveCustomer(customer.id, fish.id)} className="p-1 bg-green-900/30 border border-green-500/30 rounded text-[10px] text-green-300">
                                                    {fish.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-right">
                                            <button onClick={() => rejectCustomer(customer.id)} className="text-[10px] text-red-400 underline">Reddet</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {restaurantTab === 'market' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => buyIngredient('vegetables', 5, 200)} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center">
                                    <span className="text-2xl mb-1">🥬</span>
                                    <span className="text-xs font-bold text-white">Yeşillik (5x)</span>
                                    <span className="text-[10px] text-yellow-400">200 TL</span>
                                </button>
                                <button onClick={() => buyIngredient('raki', 1, 500)} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center">
                                    <span className="text-2xl mb-1">🍼</span>
                                    <span className="text-xs font-bold text-white">İçecek (1x)</span>
                                    <span className="text-[10px] text-yellow-400">500 TL</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal isOpen={activeModal === 'duels'} onClose={() => setActiveModal(null)} title="Lig ve Düellolar">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
                        <div className="text-4xl">{currentLeague.icon}</div>
                        <div>
                            <div className={`font-black text-lg ${currentLeague.color}`}>{currentLeague.name}</div>
                            <div className="text-xs text-slate-400">Puan: {stats.leaguePoints} LP</div>
                            {nextLeague && <div className="text-[10px] text-slate-500 mt-1">Sonraki Lig: {nextLeague.minLP} LP</div>}
                        </div>
                    </div>

                    <Section title="Rakipler">
                        <div className="space-y-2">
                            {RIVALS.filter(r => LEAGUES.findIndex(l => l.id === r.minLeague) <= LEAGUES.findIndex(l => l.id === currentLeague.id)).map(rival => (
                                <div key={rival.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl bg-slate-900 w-10 h-10 flex items-center justify-center rounded-full">{rival.icon}</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{rival.name}</div>
                                            <div className="text-[10px] text-slate-400">{rival.title}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { startDuel(rival.id); setActiveModal(null); }}
                                        disabled={duel.active}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold"
                                    >
                                        MEYDAN OKU
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'slots'} onClose={() => setActiveModal(null)} title="Şans Makinesi">
                <div className="flex flex-col items-center">
                    <div className="bg-slate-950 p-6 rounded-3xl border-4 border-yellow-600 shadow-2xl mb-6 relative overflow-hidden">
                        <div className="flex gap-2 mb-2">
                            {slotReels.map((r, i) => (
                                <div key={i} className="w-16 h-24 bg-white text-4xl flex items-center justify-center rounded border-2 border-slate-300 shadow-inner">
                                    {isSpinning ? <span className="animate-spin">❓</span> : r}
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl"></div>
                    </div>

                    {lastWin && (
                        <div className="mb-4 text-center animate-bounce">
                            <div className="text-yellow-400 font-black text-2xl">{lastWin.type === 'jackpot' ? 'JACKPOT!' : 'KAZANDIN!'}</div>
                            <div className="text-white font-bold">+{lastWin.amount} TL</div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setSlotBet(Math.max(100, slotBet - 100))} className="w-8 h-8 bg-slate-700 rounded-full font-bold">-</button>
                        <div className="font-mono text-xl font-bold text-yellow-500">{slotBet} TL</div>
                        <button onClick={() => setSlotBet(Math.min(stats.money, slotBet + 100))} className="w-8 h-8 bg-slate-700 rounded-full font-bold">+</button>
                    </div>

                    <button
                        onClick={handleSlotSpin}
                        disabled={isSpinning || stats.money < slotBet}
                        className="w-full py-4 bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-xl rounded-2xl shadow-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
                    >
                        ÇEVİR
                    </button>
                    <div className="mt-2 text-xs text-slate-500">3 Kiraz = 2x | 3 Elmas = Jackpot</div>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)} title="Banka">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-4 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">HESAP BAKİYESİ</div>
                    <div className="text-3xl font-mono font-bold text-green-400">{stats.bankBalance.toLocaleString()} TL</div>
                    <div className="text-[10px] text-green-500/80 mt-1">Faiz Getirisi: %1 / dakika</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <button onClick={() => bankDeposit(1000)} disabled={stats.money < 1000} className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs disabled:opacity-50">YATIR (1.000 TL)</button>
                    <button onClick={() => bankWithdraw(1000)} disabled={stats.bankBalance < 1000} className="py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs disabled:opacity-50">ÇEK (1.000 TL)</button>
                </div>

                <div className="text-xs text-slate-500 text-center">
                    Para bankadayken güvendedir ve faiz getirir.
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'pets'} onClose={() => setActiveModal(null)} title="Yoldaşlar">
                <div className="space-y-3">
                    {PETS.map(pet => {
                        const isOwned = ownedPets.some(p => p.id === pet.id);
                        return (
                            <div key={pet.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{pet.icon}</div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{pet.name}</div>
                                        <div className="text-xs text-slate-400">{pet.desc}</div>
                                    </div>
                                </div>
                                {isOwned ? (
                                    <span className="text-xs font-bold text-green-400 px-3">SAHİPSİN</span>
                                ) : (
                                    <button onClick={() => buyPet(pet.id)} className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-bold">{pet.price} TL</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'career'} onClose={() => setActiveModal(null)} title="Kariyer">
                <div className="space-y-6">
                    <Section title="Kişisel Rekorlar (Lokal Top 10)">
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                            {Object.entries(pedia)
                                .filter(([_, data]) => data.maxWeight > 0)
                                .sort((a, b) => b[1].maxWeight - a[1].maxWeight)
                                .slice(0, 10)
                                .map(([fishName, data], idx) => (
                                <div key={fishName} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'} font-black text-sm w-5 text-center`}>#{idx + 1}</div>
                                        <div className="text-slate-300 text-sm font-bold flex items-center gap-2">
                                            <span>{fishName}</span>
                                        </div>
                                    </div>
                                    <div className="font-mono text-cyan-400 font-bold">{data.maxWeight.toFixed(2)} kg</div>
                                </div>
                            ))}
                            {Object.keys(pedia).length === 0 && (
                                <div className="text-xs text-slate-500 text-center py-4 italic">Henüz rekorluk balık tutulmadı.</div>
                            )}
                        </div>
                    </Section>

                    <Section title="Genel İstatistikler">
                        <StatRow label="Toplam Yakalanan" value={lifetimeStats.totalCaught} icon={<Fish size={14} />} />
                        <StatRow label="Toplam Kazanç" value={`${lifetimeStats.totalMoneyEarned} TL`} icon={<Briefcase size={14} />} />
                        <StatRow label="En Ağır Balık" value={`${lifetimeStats.heaviestFish} kg`} icon={<Scale size={14} />} />
                        <StatRow label="Efsanevi" value={lifetimeStats.legendariesCaught} icon={<Crown size={14} />} />
                    </Section>

                    <Section title="Başarımlar">
                        <div className="grid grid-cols-5 gap-2">
                            {ACHIEVEMENTS.map(ach => {
                                const isUnlocked = ach.condition(lifetimeStats, { stats, mapParts } as any);
                                return (
                                    <div key={ach.id} className={`aspect-square rounded-xl flex items-center justify-center text-2xl border ${isUnlocked ? 'bg-yellow-900/30 border-yellow-500' : 'bg-slate-800 border-slate-700 opacity-30 grayscale'}`} title={ach.title}>
                                        {ach.icon}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'prestige'} onClose={() => setActiveModal(null)} title="Prestij (Rebirth)">
                <div className="text-center py-4">
                    <div className="text-fuchsia-500 font-bold text-lg mb-2">Mevcut İnciler: {stats.pearls} 🔮</div>
                    <p className="text-xs text-slate-400 mb-4">Seviye 50'ye ulaştığında her şeyi sıfırlayıp kalıcı güçlendirmelerle yeniden başlayabilirsin.</p>

                    {canPrestige ? (
                        <button onClick={doPrestige} className="w-full py-3 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-fuchsia-900/50 animate-pulse">
                            PRESTİJ YAP (+{calculatePrestigePearls()} İnci)
                        </button>
                    ) : (
                        <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-500">
                            Prestij için Seviye 50 olmalısın.
                        </div>
                    )}
                </div>

                <Section title="Kadim Market">
                    {PRESTIGE_UPGRADES.map(upg => {
                        const level = prestigeUpgrades[upg.id] || 0;
                        return (
                            <div key={upg.id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-fuchsia-900/30 rounded-xl mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{upg.icon}</div>
                                    <div>
                                        <div className="font-bold text-fuchsia-200 text-sm">{upg.name} <span className="text-slate-500 text-xs">Lvl {level}</span></div>
                                        <div className="text-xs text-fuchsia-400/70">{upg.desc}</div>
                                    </div>
                                </div>
                                <button onClick={() => buyPrestigeUpgrade(upg.id)} className="px-3 py-1 bg-fuchsia-900/50 border border-fuchsia-500 text-fuchsia-300 rounded text-xs font-bold">
                                    {upg.cost} 🔮
                                </button>
                            </div>
                        );
                    })}
                </Section>
            </Modal>

            {duel.active && !duel.finished && (
                <div className="absolute top-20 left-4 right-4 z-40 animate-slide-in-right">
                    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-red-500/50 p-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div className="text-2xl">⚔️</div>
                                <div className="font-bold text-red-400 uppercase tracking-widest text-xs">DÜELLO</div>
                            </div>
                            <div className="font-mono text-xl font-bold text-white">{duel.duration}s</div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                    <span>SEN</span>
                                    <span>{duel.playerScore}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (duel.playerScore / (duel.playerScore + duel.rivalScore || 1)) * 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                    <span>RAKİP</span>
                                    <span>{duel.rivalScore}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.min(100, (duel.rivalScore / (duel.playerScore + duel.rivalScore || 1)) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {combo > 0 && (
                <div className="absolute top-28 right-4 z-40 animate-slide-in-right">
                    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-yellow-500/50 p-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex flex-col items-center animate-[pulse_2s_infinite]">
                        <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest">KOMBO</div>
                        <div className="text-3xl font-black text-white leading-none">{combo}x</div>
                        <div className="text-[10px] text-slate-400">Gelir +%{Math.min(100, combo * 5)}</div>
                    </div>
                </div>
            )}

            <div 
                className="absolute bottom-36 w-full overflow-hidden bg-slate-900/80 border-y border-white/5 backdrop-blur-sm z-20 h-6 flex items-center pointer-events-auto cursor-pointer hover:bg-slate-800 transition"
                onClick={() => {
                    if (newsTicker.includes('DÜELLO')) {
                        const rivalName = newsTicker.split(': ')[1].split(' seni')[0];
                        const rival = RIVALS.find(r => r.name === rivalName);
                        if (rival) {
                            setDuelAcceptance({ rivalId: rival.id, name: rival.name, icon: rival.icon });
                        }
                    }
                }}
            >
                <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] text-[10px] font-mono text-cyan-300 px-4">
                    📢 {newsTicker} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏦 Banka Faizi: %1/dk &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 🏆 Lig Sezonu Devam Ediyor!
                </div>
            </div>

            {/* Duel Acceptance Modal */}
            <Modal isOpen={!!duelAcceptance} onClose={() => setDuelAcceptance(null)} title="Meydan Okuma!">
                <div className="text-center py-6">
                    <div className="text-6xl mb-4 bg-slate-800 w-24 h-24 flex items-center justify-center rounded-full mx-auto border-4 border-red-500 shadow-lg shadow-red-900/20">
                        {duelAcceptance?.icon}
                    </div>
                    <div className="text-2xl font-black text-white mb-1">{duelAcceptance?.name}</div>
                    <div className="text-slate-400 text-sm mb-6">"Seni balıkçılıkta yenebileceğimi düşünüyorum. Kapışmaya var mısın?"</div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setDuelAcceptance(null)}
                            className="py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
                        >
                            BELKİ SONRA
                        </button>
                        <button 
                            onClick={() => {
                                if (duelAcceptance) startDuel(duelAcceptance.rivalId);
                                setDuelAcceptance(null);
                            }}
                            className="py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/50 animate-pulse"
                        >
                            KABUL ET!
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Rival Visual Indicator in Scene (Top Left area) */}
            {newsTicker.includes('DÜELLO') && gameState === GameState.IDLE && (
                <div className="absolute top-28 left-4 z-40 animate-bounce pointer-events-auto cursor-pointer"
                    onClick={() => {
                        const rivalName = newsTicker.split(': ')[1].split(' seni')[0];
                        const rival = RIVALS.find(r => r.name === rivalName);
                        if (rival) setDuelAcceptance({ rivalId: rival.id, name: rival.name, icon: rival.icon });
                    }}
                >
                    <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-lg ring-4 ring-red-500/30">
                        👤
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-red-600 text-[10px] font-black px-1 rounded border border-red-600 uppercase">VS</div>
                </div>
            )}

            {/* MODALS RENDERED SEPARATELY TO BE OUTSIDE THE MAIN FLEX COLUMN */}
            <div className="pointer-events-auto">
                <Modal isOpen={!!offlineEarningsModal} onClose={collectOfflineEarnings} title="Hoşgeldin!">
                    <div className="text-center py-6">
                        <div className="text-4xl mb-2">🌊</div>
                        <div className="text-slate-300">Sen yokken balıkçılar çalıştı!</div>
                        {offlineEarningsModal && (
                        <div className="flex flex-col gap-2 my-4 text-left bg-slate-800/50 p-4 rounded-xl">
                            {offlineEarningsModal.net > 0 && <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400">Otomatik Ağ Geliri:</span><span className="text-green-400">+{offlineEarningsModal.net} TL</span></div>}
                            {offlineEarningsModal.tourism > 0 && <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400">Akvaryum Turizmi:</span><span className="text-green-400">+{offlineEarningsModal.tourism} TL</span></div>}
                            <div className="w-full h-px bg-slate-700 my-1 font-bold"></div>
                            <div className="flex justify-between items-center text-lg font-black"><span className="text-yellow-500">TOPLAM:</span><span className="text-yellow-400">+{offlineEarningsModal.total} TL</span></div>
                        </div>
                        )}
                        <button onClick={collectOfflineEarnings} className="w-full py-3 bg-green-600 hover:bg-green-500 transition-colors rounded-xl font-bold text-white shadow-lg shadow-green-900/50 uppercase tracking-tighter">HAVALEYİ AL</button>
                    </div>
                </Modal>

                <Modal isOpen={!!dailyRewardPopup?.active} onClose={claimDailyReward} title="Günlük Giriş Ödülü">
                    <div className="text-center py-6">
                        <div className="text-5xl mb-2 animate-bounce">📅</div>
                        <div className="text-slate-300 text-sm">Geri döndüğün için teşekkürler!</div>
                        <div className="my-6 p-4 bg-slate-800 rounded-2xl border border-white/5">
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">GİRİŞ SERİSİ</div>
                            <div className="text-4xl font-black text-cyan-400 mb-2">{dailyRewardPopup?.streak} GÜN</div>
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">BUGÜNKÜ ÖDÜLÜN</div>
                        <div className="text-3xl font-bold text-yellow-400 mb-6">+{dailyRewardPopup?.reward} TL</div>
                        <button onClick={claimDailyReward} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl">ÖDÜLÜ AL</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};