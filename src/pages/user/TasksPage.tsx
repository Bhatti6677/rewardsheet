import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Crown,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Shield,
  Award,
  Flame,
  Star,
  Gem,
  Medal,
  Trophy,
  Check,
  Zap,
  ArrowDownLeft,
  X,
  ShieldCheck,
  Sparkles,
  Layers,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

// Icons mapped to the 10 levels
const LEVEL_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Shield,
  3: Award,
  4: Flame,
  5: Star,
  6: Gem,
  7: Medal,
  8: Trophy,
  9: Zap,
  10: Crown,
};

// Tier metadata for all 10 levels
const TIER_METADATA: Record<
  number,
  {
    tierName: string;
    badge: string;
    bonus: number;
    points: number;
  }
> = {
  1: { tierName: 'Novice Rewards', badge: 'Tier 1', bonus: 500, points: 100 },
  2: { tierName: 'Bronze Earner', badge: 'Tier 2', bonus: 400, points: 100 },
  3: { tierName: 'Silver Verified', badge: 'Tier 3', bonus: 600, points: 100 },
  4: { tierName: 'Gold Sovereign', badge: 'Tier 4', bonus: 800, points: 100 },
  5: { tierName: 'Platinum Master', badge: 'Tier 5', bonus: 1000, points: 100 },
  6: { tierName: 'Diamond Prestige', badge: 'Tier 6', bonus: 1200, points: 100 },
  7: { tierName: 'Ruby Champion', badge: 'Tier 7', bonus: 1500, points: 100 },
  8: { tierName: 'Emerald Elite', badge: 'Tier 8', bonus: 2000, points: 100 },
  9: { tierName: 'Sapphire Royal', badge: 'Tier 9', bonus: 2500, points: 100 },
  10: { tierName: 'Imperial Pinnacle', badge: 'Tier 10', bonus: 3000, points: 100 },
};

const triggerFireworks = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 40 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
      colors: ['#FFD45A', '#1459E8', '#22D3EE', '#10D6A0'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD45A', '#1459E8', '#22D3EE', '#10D6A0'],
    });
  }, 250);
};

const cleanTaskTitle = (title: string) => {
  if (!title) return '';
  if (title.startsWith('Prepaid Task')) return title;
  return title.replace(/\s+Task\s*#?\d+$/i, '').trim();
};



export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, wallet } = useAuth();

  const [levels, setLevels] = useState<any[]>([]);
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);
  const [currentLevelData, setCurrentLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unlockingLevel, setUnlockingLevel] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState<Record<number, boolean>>({});

  const [congratsModalLevel, setCongratsModalLevel] = useState<any | null>(null);
  const [prepaidModalTask, setPrepaidModalTask] = useState<any | null>(null);

  useBodyScrollLock(Boolean(congratsModalLevel || prepaidModalTask));
  const tasksSectionRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Clean up any stale mock level keys from legacy versions
  useEffect(() => {
    try {
      for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`royal_completed_lvl_${i}`);
      }
    } catch {}
  }, []);

  // Compute User's Current Eligible Active Level
  const userCurrentLevelNumber = useMemo(() => {
    if (!levels || levels.length === 0) return 1;
    const activeUnlocked = levels.find(
      (l) => l.isUnlocked && (l.approvedTaskCount || 0) < (l.requiredTaskCount || 10)
    );
    if (activeUnlocked) return activeUnlocked.levelNumber;
    const lastUnlocked = levels.filter((l) => l.isUnlocked).slice(-1)[0];
    return lastUnlocked ? lastUnlocked.levelNumber : 1;
  }, [levels]);

  // Compute if User has reached Level 4 or above (unlocked by admin)
  const isUserAtLevel4OrAbove = useMemo(() => {
    if (!levels || levels.length === 0) return false;
    const lvl4 = levels.find((l) => l.levelNumber === 4);
    const lvl4ActiveOrDone = Boolean(lvl4 && (lvl4.isUnlocked || (lvl4.approvedTaskCount || 0) > 0 || lvl4.isCompleted));
    const isLevel4Plus = userCurrentLevelNumber >= 4;
    return Boolean(lvl4ActiveOrDone || isLevel4Plus);
  }, [levels, userCurrentLevelNumber]);

  const { level, tasks = [], isLevelUnlocked } = currentLevelData || {};
  const selectedLevelSummary = levels.find((l) => l.levelNumber === activeLevelNumber);
  const isSelectedLevelLocked = selectedLevelSummary
    ? !selectedLevelSummary.isUnlocked && (selectedLevelSummary.approvedTaskCount || 0) < 10
    : !isLevelUnlocked;

  const liveApprovedTasksCount = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return 0;
    return tasks.filter((t: any) => {
      const uStatus = String(t.userStatus || '').toUpperCase();
      const status = String(t.status || '').toUpperCase();
      const subStatus = String(t.submission?.status || '').toUpperCase();
      return (
        uStatus === 'APPROVED' ||
        uStatus === 'COMPLETED' ||
        uStatus === 'DONE' ||
        status === 'APPROVED' ||
        status === 'COMPLETED' ||
        subStatus === 'APPROVED' ||
        t.isCompleted === true ||
        t.completed === true
      );
    }).length;
  }, [tasks]);

  const isLevelUnlockedByUser = (lvl: any) => {
    if (!lvl) return false;
    if (lvl.levelNumber === 1) return true;
    if (lvl.isUnlocked) return true;
    if (lvl.levelNumber <= userCurrentLevelNumber) return true;
    if (unlockedLevels[lvl.levelNumber]) return true;
    return false;
  };

  const handleSelectLevel = (levelNumber: number) => {
    if (levelNumber < 1 || levelNumber > 10) return;
    setActiveLevelNumber(levelNumber);
    setSearchParams({ level: String(levelNumber) });
    setActionError(null);

    // Scroll active tab into view smoothly
    if (tabsScrollRef.current) {
      const activeBtn = tabsScrollRef.current.querySelector(
        `[data-level="${levelNumber}"]`
      ) as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  // Fetch all 10 levels
  const fetchLevels = async (keepCurrentSelection = false) => {
    try {
      const res = await api.getLevels({ bypassCache: true });
      const loadedLevels = res.levels || [];
      setLevels(loadedLevels);

      const userCurrent =
        loadedLevels.find((l: any) => l.isUnlocked && !l.isCompleted) ||
        loadedLevels.filter((l: any) => l.isUnlocked).slice(-1)[0] ||
        loadedLevels[0];
      const currentEligibleNumber = userCurrent ? userCurrent.levelNumber : 1;

      if (!keepCurrentSelection) {
        const paramLevel = parseInt(searchParams.get('level') || '', 10);
        const targetParamLvl = loadedLevels.find((l: any) => l.levelNumber === paramLevel);
        if (paramLevel >= 1 && paramLevel <= 10 && targetParamLvl && targetParamLvl.isUnlocked) {
          setActiveLevelNumber(paramLevel);
        } else {
          setActiveLevelNumber(currentEligibleNumber);
          setSearchParams({ level: String(currentEligibleNumber) }, { replace: true });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (levels.length === 0) {
        setActionError('Failed to load level progression.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // Fetch tasks whenever active level changes
  useEffect(() => {
    if (!activeLevelNumber) return;
    setActionError(null);
    setActionSuccess(null);

    const cached = api.getCachedData<any>(`/tasks/levels/${activeLevelNumber}`);
    if (cached && cached.tasks && cached.tasks.length > 0) {
      setCurrentLevelData(cached);
      setTasksLoading(false);
    } else {
      setTasksLoading(true);
    }

    api
      .getLevelTasks(activeLevelNumber, { bypassCache: true })
      .then((data) => {
        setCurrentLevelData(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cached) {
          setActionError(`Failed to load tasks for Level ${activeLevelNumber}.`);
        }
      })
      .finally(() => setTasksLoading(false));
  }, [activeLevelNumber]);

  // Realtime Live Update Listener
  useEffect(() => {
    const handleLiveEvent = (e: any) => {
      const type = e.detail?.type;
      if (type === 'wallet') return;

      if (type === 'task' || type === 'command' || type === 'all' || type === 'refresh') {
        const payload = e.detail?.payload;
        if (payload?.taskId && payload?.status) {
          setCurrentLevelData((prev: any) => {
            if (!prev || !prev.tasks) return prev;
            return {
              ...prev,
              tasks: prev.tasks.map((t: any) =>
                t.id === payload.taskId
                  ? {
                      ...t,
                      userStatus: payload.status,
                      ...(payload.status === 'APPROVED' ? { isPaidUnlocked: true } : {}),
                    }
                  : t
              ),
            };
          });
        }
        api.invalidateCache('/tasks');
        fetchLevels(true);
        api
          .getLevelTasks(activeLevelNumber, { bypassCache: true })
          .then((data) => setCurrentLevelData(data))
          .catch(() => {});
      }
    };

    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => {
      window.removeEventListener('royal_live_update', handleLiveEvent);
    };
  }, [activeLevelNumber, userCurrentLevelNumber]);


  if (loading && levels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Loading Tasks & Levels...</p>
      </div>
    );
  }

  const totalTasksCount =
    selectedLevelSummary?.requiredTaskCount ||
    level?.requiredTaskCount ||
    (tasks && tasks.length > 0 ? tasks.length : 0) ||
    10;

  const summaryApprovedCount = selectedLevelSummary?.approvedTaskCount ?? 0;
  const approvedTaskCount = Math.max(summaryApprovedCount, liveApprovedTasksCount);
  const progressPercent =
    activeLevelNumber === 4
      ? approvedTaskCount >= 1
        ? 100
        : 0
      : Math.min(100, Math.round((approvedTaskCount / totalTasksCount) * 100));

  const isSelectedLevelCompleted =
    activeLevelNumber === 4
      ? approvedTaskCount >= 1
      : Boolean(
          (approvedTaskCount >= totalTasksCount && totalTasksCount > 0) ||
          (tasks.length >= totalTasksCount &&
            totalTasksCount > 0 &&
            tasks.every((t: any) => {
              const uStatus = String(t.userStatus || '').toUpperCase();
              const status = String(t.status || '').toUpperCase();
              const subStatus = String(t.submission?.status || '').toUpperCase();
              return (
                uStatus === 'APPROVED' ||
                uStatus === 'COMPLETED' ||
                uStatus === 'DONE' ||
                status === 'APPROVED' ||
                status === 'COMPLETED' ||
                subStatus === 'APPROVED' ||
                t.isCompleted === true ||
                t.completed === true
              );
            }))
        );

  const meta = TIER_METADATA[activeLevelNumber] || TIER_METADATA[1];
  const LevelIcon = LEVEL_ICONS[activeLevelNumber] || Crown;

  // Unlock Level Handler
  const handleUnlockLevelAction = async (lvl: any) => {
    if (!lvl) return;
    setUnlockingLevel(true);
    setActionError(null);
    try {
      if (typeof (api as any).unlockLevel === 'function') {
        await (api as any).unlockLevel(lvl.levelNumber);
      }
      try {
        localStorage.setItem(`royal_unlocked_lvl_${lvl.levelNumber}`, 'true');
      } catch {}
      setUnlockedLevels((prev) => ({ ...prev, [lvl.levelNumber]: true }));
      triggerFireworks();
      setCongratsModalLevel(lvl);
      await fetchLevels(true);
      const updatedData = await api.getLevelTasks(lvl.levelNumber);
      setCurrentLevelData(updatedData);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || `Failed to unlock Level ${lvl.levelNumber}`);
    } finally {
      setUnlockingLevel(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 select-none pb-12">
      {/* Alert Notices */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 shadow-md">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* ========================================================
          1. CLEAN LEVEL TABS (Fast & Simple 10-Level Switcher)
          ======================================================== */}
      <section className="bg-[#0E0B0E] border border-red-900/45 p-1.5 sm:p-2 rounded-2xl shadow-lg">
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5"
        >
          {levels.map((lvl) => {
            const isSelected = lvl.levelNumber === activeLevelNumber;
            const lvlTotal = lvl.requiredTaskCount || 10;
            const lvlApproved = lvl.approvedTaskCount || 0;
            const isCompleted =
              lvl.levelNumber === 4 ? lvlApproved >= 1 : lvlApproved >= lvlTotal;
            const isLocked = !lvl.isUnlocked && !isCompleted;
            const isPreviewOnly = false;

            return (
              <button
                key={lvl.id}
                data-level={lvl.levelNumber}
                onClick={() => handleSelectLevel(lvl.levelNumber)}
                className={`flex-1 min-w-[74px] sm:min-w-[84px] py-2 px-2 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md ring-2 ring-amber-400/70 scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#091F18] text-emerald-400 border border-emerald-500/30 hover:bg-[#0D2B22]'
                    : isPreviewOnly
                    ? 'bg-[#160F14] text-rose-300 border border-rose-500/30 hover:bg-[#1F151C]'
                    : isLocked
                    ? 'bg-[#08080B]/80 text-zinc-500 border border-zinc-800/80 hover:bg-[#101015]'
                    : 'bg-[#180E12] text-amber-300 border border-red-500/30 hover:bg-[#221319]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] sm:text-xs">
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isPreviewOnly ? (
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Lvl {lvl.levelNumber}</span>
                </div>
                <span
                  className={`text-[9px] font-semibold ${
                    isSelected
                      ? 'text-amber-300'
                      : isCompleted
                      ? 'text-emerald-400/80'
                      : isPreviewOnly
                      ? 'text-rose-300/80'
                      : isLocked
                      ? 'text-zinc-500'
                      : 'text-amber-400/80'
                  }`}
                >
                  {isCompleted ? 'Completed' : isPreviewOnly ? 'View Tasks' : isLocked ? 'Locked' : 'Processing'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          2. ACTIVE LEVEL SUMMARY CARD (Crisp & Informative)
          Everything in one unified card: Icon, Name, Progress & Rewards
          ======================================================== */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#180B10] via-[#120B0F] to-[#0A0A0D] border border-red-900/55 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Icon & Level Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#09090C] rounded-[14px] flex items-center justify-center">
                <LevelIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 rounded-md">
                  Level {activeLevelNumber}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelectedLevelCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                      : isSelectedLevelLocked
                      ? 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {isSelectedLevelCompleted
                    ? 'Completed'
                    : isSelectedLevelLocked
                    ? 'Locked'
                    : 'Processing'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {meta.tierName}
              </h2>
            </div>
          </div>

          {/* Right: Total Tasks Capsule */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#09090C]/90 border border-red-900/50 shadow-sm backdrop-blur-md">
              <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                <Layers className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Level Tasks</span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {totalTasksCount} Tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-red-500" />
              Progress
            </span>
            <span className="font-bold text-white text-xs">
              {activeLevelNumber === 4
                ? `${approvedTaskCount >= 1 ? '1 / 1' : '0 / 1'} Required Task Done`
                : `${approvedTaskCount} / ${totalTasksCount} Tasks Done`} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-[#07070A] rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Notice if locked */}
        {isSelectedLevelLocked && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-3 text-xs">
            <span className="text-zinc-200">
              {selectedLevelSummary?.lockReason ||
                `Level ${activeLevelNumber} is locked. Please complete Level ${userCurrentLevelNumber} first to unlock Level ${activeLevelNumber}.`}
            </span>
            {userCurrentLevelNumber !== activeLevelNumber && (
              <button
                onClick={() => handleSelectLevel(userCurrentLevelNumber)}
                className="text-red-400 font-bold hover:underline flex-shrink-0 cursor-pointer"
              >
                Active Lvl {userCurrentLevelNumber} →
              </button>
            )}
          </div>
        )}

        {/* Notice for Level 4 if user completed their 1 task */}
        {activeLevelNumber === 4 && (selectedLevelSummary?.approvedTaskCount ?? 0) >= 1 && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#0A1814] to-emerald-500/15 border border-emerald-400/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {levels.find((l) => l.levelNumber === 5)?.isUnlocked
                  ? 'You have completed your Level 4 task! The remaining Level 4 tasks are closed. Level 5 tasks are now unlocked.'
                  : 'You have completed your Level 4 task! The remaining Level 4 tasks are closed. Level 5 will unlock upon administrator approval.'}
              </span>
            </div>
            <button
              onClick={() => handleSelectLevel(5)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex-shrink-0 cursor-pointer transition-all shadow-sm"
            >
              Go to Level 5 →
            </button>
          </div>
        )}

        {/* Notice for Level 5 requiring Level 4 Task */}
        {activeLevelNumber === 5 && !isSelectedLevelLocked && tasks && tasks.length > 0 && tasks[0]?.userStatus === 'LOCKED' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-500/15 via-[#180B10] to-red-500/15 border border-red-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-red-300">
              <Sparkles className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{tasks[0]?.lockMessage || 'Complete any one Level 4 prepaid task to unlock Level 5 task participation.'}</span>
            </div>
            <button
              onClick={() => handleSelectLevel(4)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex-shrink-0 cursor-pointer transition-all shadow-sm"
            >
              Go to Level 4 →
            </button>
          </div>
        )}
      </section>

      {/* Unlock Level Button (if unlocked & ready to activate) */}
      {selectedLevelSummary && !isSelectedLevelLocked && !isLevelUnlockedByUser(selectedLevelSummary) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-[#140B0E] to-amber-500/20 border-2 border-red-500/60 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Level {activeLevelNumber} Ready for Activation!
            </h4>
            <p className="text-xs text-zinc-300">Click to activate your {totalTasksCount} new assignments.</p>
          </div>
          <button
            onClick={() => handleUnlockLevelAction(selectedLevelSummary)}
            disabled={unlockingLevel}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            {unlockingLevel ? 'Activating...' : `Unlock Level ${activeLevelNumber} 🎉`}
          </button>
        </div>
      )}

      {/* ========================================================
          3. STANDALONE TASK ROWS (Compact, Clean & Direct)
          ======================================================== */}
      <section ref={tasksSectionRef} className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <span>Tasks in Level {activeLevelNumber}</span>
          </h3>
          <span className="text-xs text-zinc-400 font-medium">
            {approvedTaskCount} of {totalTasksCount} Approved
          </span>
        </div>

        {/* Desktop column header labels */}
        <div className="hidden sm:flex items-center justify-between px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <div className="flex-1">Task Assignment</div>
          <div className="flex items-center gap-5">
            <span className="w-24 text-right">Reward</span>
            <span className="w-20 text-center">Action</span>
          </div>
        </div>

        {tasksLoading && (!tasks || tasks.length === 0) ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-red-600/30 border-t-red-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Loading tasks...</p>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task: any) => {
              const isPrepaid = Boolean(
                task.isPaid ||
                  (task.unlockFee && task.unlockFee > 0) ||
                  task.taskType?.toLowerCase().includes('prepaid')
              );
              const unlockFee = task.unlockFee || 0;

              const isPastCompletedLevel =
                activeLevelNumber === 4
                  ? (selectedLevelSummary?.approvedTaskCount ?? 0) >= 1
                  : (selectedLevelSummary?.approvedTaskCount ?? 0) >= totalTasksCount;
              const isTaskLocked =
                isSelectedLevelLocked ||
                (task.userStatus === 'LOCKED' && !(activeLevelNumber <= 3 && isPastCompletedLevel));
              const isApproved =
                !isSelectedLevelLocked &&
                (task.userStatus === 'APPROVED' || (activeLevelNumber <= 3 && isPastCompletedLevel));
              const isPending =
                !isSelectedLevelLocked &&
                task.userStatus === 'PENDING_VERIFICATION';
              const isRejected =
                !isSelectedLevelLocked &&
                task.userStatus === 'REJECTED';

              const isHiddenLockedTask = isTaskLocked;

              return (
                <div
                  id={`task-row-${task.taskNumber}`}
                  key={task.id}
                  onClick={() => {
                    navigate(`/app/tasks/${task.id}`);
                  }}
                  className={`flex items-center justify-between gap-3 p-2.5 sm:px-4 sm:py-3 rounded-xl border transition-all duration-150 ${
                    isHiddenLockedTask
                      ? 'bg-[#0B090C]/80 border-zinc-800/70 opacity-80 hover:border-red-500/40 cursor-pointer'
                      : isTaskLocked
                      ? 'bg-[#0B090C]/80 border-zinc-800/70 opacity-85 hover:border-red-500/40 cursor-pointer'
                      : isApproved
                      ? 'bg-[#081C15]/80 border-emerald-500/35 hover:border-emerald-400 cursor-pointer'
                      : isPending
                      ? 'bg-[#190D12]/80 border-red-500/40 hover:border-red-400 cursor-pointer'
                      : isPrepaid
                      ? 'bg-gradient-to-r from-[#240B11] to-[#11090C] border-amber-400/70 hover:border-amber-400 cursor-pointer'
                      : 'bg-[#130C10]/90 border-red-900/50 hover:border-red-500 cursor-pointer'
                  }`}
                >
                  {/* Left: Task Number & Task Name */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isPending
                          ? 'bg-red-500/25 text-red-400'
                          : isTaskLocked
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          : isPrepaid
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-red-600/25 text-red-400 border border-red-500/30'
                      }`}
                    >
                      #{task.taskNumber < 10 ? `0${task.taskNumber}` : task.taskNumber}
                    </span>

                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      {isHiddenLockedTask ? (
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-400 flex items-center gap-1.5 truncate">
                          <Lock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span>Locked Task #{task.taskNumber}</span>
                        </h4>
                      ) : (
                        <>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {cleanTaskTitle(task.title)}
                          </h4>

                          {isPrepaid ? (
                            <span className="inline-flex text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.5 rounded flex-shrink-0">
                              Price: PKR {unlockFee.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded flex-shrink-0">
                              Free Task
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: PKR Reward & Action */}
                  <div className="flex items-center gap-2.5 sm:gap-5 flex-shrink-0">
                    {isHiddenLockedTask ? (
                      <span className="text-xs font-bold text-zinc-500 whitespace-nowrap min-w-[65px] sm:min-w-[75px] text-right flex items-center justify-end gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-amber-400 whitespace-nowrap min-w-[65px] sm:min-w-[75px] text-right">
                        {task.rewardAmount > 0 ? `PKR ${task.rewardAmount?.toLocaleString()}` : 'Free Task'}
                      </span>
                    )}

                    {/* Option to Open / View */}
                    <div className="flex-shrink-0">
                      {isHiddenLockedTask || isTaskLocked ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/tasks/${task.id}`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Lock className="w-3 h-3 text-red-400" />
                          <span>Open</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/tasks/${task.id}`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                            isApproved
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                              : isPending
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                              : isPrepaid
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110'
                              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white'
                          }`}
                        >
                          <span>Open</span>
                          {isApproved ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#110C0F] border border-red-900/40">
            <p className="text-zinc-400 text-xs">No tasks found for this tier.</p>
          </div>
        )}
      </section>

      {/* Level Completed Celebration Banner */}
      {isSelectedLevelCompleted && activeLevelNumber < 10 && (
        <section className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#071F42] to-emerald-500/15 border border-emerald-400/40 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Level {activeLevelNumber} Completed! 🎉
            </h4>
            <p className="text-[11px] text-slate-300">
              All required tasks completed! Ready for Level {activeLevelNumber + 1}?
            </p>
          </div>

          <button
            onClick={() => {
              const nextLevelNum = activeLevelNumber + 1;
              handleSelectLevel(nextLevelNum);
              const nextLvl = levels.find((l) => l.levelNumber === nextLevelNum);
              if (nextLvl && !isLevelUnlockedByUser(nextLvl)) {
                handleUnlockLevelAction(nextLvl);
              }
            }}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#FFD45A] to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            Advance to Level {activeLevelNumber + 1} →
          </button>
        </section>
      )}

      {/* Level Unlocked Celebration Modal */}
      {congratsModalLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="royal-card w-full max-w-sm p-6 rounded-3xl border border-[#FFD45A]/60 bg-[#081F44] text-center space-y-4 relative shadow-2xl">
            <button
              onClick={() => setCongratsModalLevel(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#040F24] text-slate-400 hover:text-white border border-[#173C73]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#FFD45A]/20 border border-[#FFD45A]/40 mx-auto flex items-center justify-center text-[#FFD45A]">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                Level {congratsModalLevel.levelNumber} Unlocked!
              </h3>
              <p className="text-xs text-[#B7C6E4]">
                {congratsModalLevel.requiredTaskCount || 10} new assignments are now available. Complete tasks to earn task rewards.
              </p>
            </div>

            <button
              onClick={() => setCongratsModalLevel(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD45A] to-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
            >
              Start Level {congratsModalLevel.levelNumber}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
