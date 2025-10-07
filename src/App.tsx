import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { complianceItems } from './data/complianceItems';
import {
  ViewMode,
  RolePreset,
  QuickView,
  SortKey,
  Status,
  AppState,
  ComplianceItem,
} from './types/compliance';
import { STORAGE_KEY } from './utils/constants';
main
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Target,
  Activity,
  ArrowUpRight,
  Layers3,
  ShieldCheck,
  StickyNote,
} from 'lucide-react';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const statusOptions: Status[] = ['Pending', 'In Progress', 'Completed', 'Overdue'];

const priorityAccent: Record<string, { bg: string; text: string; ring: string }> = {
  Critical: {
    bg: 'from-rose-500/30 via-rose-500/10 to-transparent',
    text: 'text-rose-200',
    ring: 'border-rose-400/60',
  },
  High: {
    bg: 'from-amber-400/25 via-amber-400/10 to-transparent',
    text: 'text-amber-200',
    ring: 'border-amber-300/60',
  },
  Medium: {
    bg: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
    text: 'text-emerald-200',
    ring: 'border-emerald-300/60',
  },
  Low: {
    bg: 'from-slate-400/20 via-slate-400/10 to-transparent',
    text: 'text-slate-200',
    ring: 'border-slate-300/40',
  },
};

const statusTint: Record<Status, { dot: string; text: string; bg: string }> = {
  Pending: { dot: 'bg-slate-400', text: 'text-slate-200', bg: 'bg-slate-900/40' },
  'In Progress': { dot: 'bg-sky-400', text: 'text-sky-200', bg: 'bg-sky-900/40' },
  Completed: { dot: 'bg-emerald-400', text: 'text-emerald-200', bg: 'bg-emerald-900/40' },
  Overdue: { dot: 'bg-rose-500', text: 'text-rose-200', bg: 'bg-rose-900/40' },
};

const monthRegex = MONTHS.map((month) => ({ month, regex: new RegExp(month, 'i') }));

const findMonthInText = (text?: string | null) => {
  if (!text) return null;
  const match = monthRegex.find(({ regex }) => regex.test(text));
  return match ? match.month : null;
};

const resolveMonthForItem = (item: ComplianceItem) => {
  return findMonthInText(item.annualDate) ?? findMonthInText(item.cyclicDate) ?? findMonthInText(item.deadline) ?? null;
};

const priorityRank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const getSortValue = (item: ComplianceItem, sortKey: SortKey) => {
  if (sortKey === 'priority') {
    return priorityRank[item.priority] ?? 0;
  }

  if (sortKey === 'deadline') {
    const month = resolveMonthForItem(item);
    return month ? MONTHS.indexOf(month) : 99;
  }

  if (sortKey === 'category') return item.category;
  if (sortKey === 'type') return item.type;
  return item.title;
};

const defaultStatus: Status = 'Pending';
=======
import { encodeStateToUrl, exportJSON, exportToCSV, decodeStateFromUrl } from './utils/helpers';
import { Calendar } from 'lucide-react';
main

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showHighPriority, setShowHighPriority] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [rolePreset, setRolePreset] = useState<RolePreset>('all');
  const [quickView, setQuickView] = useState<QuickView>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({});
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: AppState = JSON.parse(raw);
        setStatusMap(parsed.statusMap || {});
        setNotesMap(parsed.notesMap || {});
main
        setTheme(parsed.theme || 'dark');

        setTheme(parsed.theme || 'light');
        setPinnedIds((parsed as any).pinnedIds || []);
main
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
  }, []);

  // deduplicate source items by id once at runtime
  const dedupedItems = useMemo(() => {
    const seen = new Set<number>();
    return complianceItems.filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    });
  }, [complianceItems]);

  // helper to ensure every item has a status (default to 'Pending')
  const ensureStatusDefaults = (current: Record<number, Status>, items: typeof complianceItems) => {
    const out: Record<number, Status> = { ...(current || {}) };
    items.forEach((it) => {
      if (!out[it.id]) out[it.id] = 'Pending';
    });
    return out;
  };

  // ensure defaults whenever the deduped items change or statusMap loads
  useEffect(() => {
    setStatusMap((prev) => {
      const merged = ensureStatusDefaults(prev, dedupedItems);
      // if nothing changed, return prev to avoid extra renders
      const same = Object.keys(merged).length === Object.keys(prev).length && Object.keys(merged).every((k) => (prev as any)[k] === (merged as any)[k]);
      return same ? prev : merged;
    });
  }, [dedupedItems]);

  useEffect(() => {
    const snapshot: Partial<AppState> = {
      statusMap,
      notesMap,
      theme,
    };
    const toSave = { ...snapshot, pinnedIds } as any;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [statusMap, notesMap, theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (rolePreset === 'all') {
      setFilterParty('all');
    } else if (rolePreset === 'council') {
      setFilterParty('Settlement Council');
    } else if (rolePreset === 'administrator') {
      setFilterParty('Settlement Administrator');
    } else if (rolePreset === 'registrar') {
      setFilterParty('MSLR Registrar');
    } else if (rolePreset === 'msgc') {
      setFilterParty('MSGC (General Council)');
    } else if (rolePreset === 'msat') {
      setFilterParty('MSAT');
    } else if (rolePreset === 'minister') {
      setFilterParty('Minister; MSGC');
    }
  }, [rolePreset]);

  const resolveStatus = (id: number) => statusMap[id] || defaultStatus;

  const filteredItems = useMemo(() => {
    // use deduplicated base and merge pinned flag
    const base = dedupedItems.map((it) => ({ ...it, pinned: pinnedIds.includes(it.id) }));

    let items = base.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.section.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesParty =
        filterParty === 'all' ||
        item.responsible === filterParty ||
        (filterParty === 'MSGC (General Council)' && item.responsible && item.responsible.includes('MSGC')) ||
        (filterParty === 'MSAT' && item.responsible && item.responsible.includes('MSAT')) ||
        (filterParty === 'Minister; MSGC' && (item.category === 'Ministerial' || item.category === 'MSGC'));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesPriority =
        !showHighPriority || (showHighPriority && (item.priority === 'Critical' || item.priority === 'High'));

      return matchesSearch && matchesType && matchesParty && matchesCategory && matchesPriority;
    });

    if (quickView === 'overdue') {
      items = items.filter((i) => resolveStatus(i.id) === 'Overdue');
    } else if (quickView === 'completed') {
      items = items.filter((i) => resolveStatus(i.id) === 'Completed');
    } else if (quickView === 'critical') {
      items = items.filter((i) => i.priority === 'Critical');
    } else if (quickView === 'upcoming') {
      items = items.filter((i) => resolveMonthForItem(i) !== null);
    }

    const dirMultiplier = sortDir === 'asc' ? 1 : -1;

    return items.sort((a, b) => {
      const valueA = getSortValue(a, sortKey);
      const valueB = getSortValue(b, sortKey);

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * dirMultiplier;
      }

      return valueA.toString().localeCompare(valueB.toString()) * dirMultiplier;
    });
  }, [searchTerm, filterType, filterParty, filterCategory, showHighPriority, quickView, sortKey, sortDir, statusMap]);

  const timelineItems = useMemo(() => {
    const ranked = [...filteredItems].sort((a, b) => {
      const monthA = resolveMonthForItem(a);
      const monthB = resolveMonthForItem(b);
      const idxA = monthA ? MONTHS.indexOf(monthA) : 99;
      const idxB = monthB ? MONTHS.indexOf(monthB) : 99;
      if (idxA !== idxB) return idxA - idxB;
      return (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
    });
    return ranked;
  }, [filteredItems]);

  const calendarBuckets = useMemo(() => {
    const buckets = new Map<string, ComplianceItem[]>();
    filteredItems.forEach((item) => {
      const month = resolveMonthForItem(item) ?? 'Flexible';
      const existing = buckets.get(month) ?? [];
      existing.push(item);
      buckets.set(month, existing);
    });
    return buckets;
  }, [filteredItems]);

  const priorityCounts = useMemo(() => {
    return complianceItems.reduce(
      (acc, item) => {
        acc[item.priority] = (acc[item.priority] ?? 0) + 1;
        return acc;
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>,
    );
  }, []);

  const statusCounts = useMemo(() => {
    return complianceItems.reduce(
      (acc, item) => {
        const status = resolveStatus(item.id);
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 } as Record<Status, number>,
    );
  }, [statusMap]);

  const completionRate = Math.round((statusCounts.Completed / complianceItems.length) * 100);
  const activeCritical = filteredItems.filter((item) => item.priority === 'Critical' && resolveStatus(item.id) !== 'Completed').length;

  const upcomingHighlights = useMemo(() => {
    return timelineItems
      .filter((item) => resolveMonthForItem(item) !== null)
      .slice(0, 5)
      .map((item) => ({
        item,
        month: resolveMonthForItem(item) ?? 'Flexible',
        status: resolveStatus(item.id),
      }));
  }, [timelineItems, statusMap]);

  const topParties = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredItems.forEach((item) => {
      counts[item.responsible] = (counts[item.responsible] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [filteredItems]);

  const handleShare = () => {
    const shareState = {
      statusMap,
      notesMap,
      theme,
      pinnedIds,
      filters: { searchTerm, filterType, filterParty, filterCategory, showHighPriority, viewMode, rolePreset, quickView, sortKey, sortDir },
    };
    const token = encodeStateToUrl(shareState);
    const url = `${window.location.origin}${window.location.pathname}?s=${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => alert('Shareable link copied to clipboard'))
      .catch(() => prompt('Copy this link', url));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    if (s) {
      const decoded = decodeStateFromUrl(s);
      if (decoded) {
        setStatusMap(decoded.statusMap || {});
        setNotesMap(decoded.notesMap || {});
        setTheme(decoded.theme || 'light');
        setPinnedIds(decoded.pinnedIds || []);
        if (decoded.filters) {
          setSearchTerm(decoded.filters.searchTerm || '');
          setFilterType(decoded.filters.filterType || 'all');
          setFilterParty(decoded.filters.filterParty || 'all');
          setFilterCategory(decoded.filters.filterCategory || 'all');
          setShowHighPriority(decoded.filters.showHighPriority || false);
        }
      }
    }
  }, []);

  const handleThemeToggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleExport = () => {
  const snapshot = { complianceItems: dedupedItems, statusMap, notesMap, pinnedIds };
  exportJSON(snapshot, 'msct-export.json');
  const csv = exportToCSV(dedupedItems, statusMap, notesMap);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // prompt CSV download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'msct-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.statusMap) setStatusMap(parsed.statusMap);
          if (parsed.notesMap) setNotesMap(parsed.notesMap);
          if (parsed.pinnedIds) setPinnedIds(parsed.pinnedIds);
          alert('Import complete');
        } catch (err) {
          alert('Failed to import: invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = (id: number, status: Status) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleNotesChange = (id: number, notes: string) => {
    setNotesMap((prev) => ({ ...prev, [id]: notes }));
  };

  const renderStatusBadge = (status: Status) => {
    const palette = statusTint[status];
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${palette.bg} ${palette.text} border border-white/10`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
        {status}
      </span>
    );
  };

  const renderCard = (item: ComplianceItem) => {
    const palette = priorityAccent[item.priority];
    const status = resolveStatus(item.id);
    return (
      <div
        key={item.id}
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-900/40 p-6 flex flex-col gap-5`}
      >
        <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${palette.bg} pointer-events-none`} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-300 uppercase tracking-[0.3em]">
              <Layers3 className="h-3.5 w-3.5" />
              {item.section}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100 drop-shadow-[0_8px_24px_rgba(15,118,110,0.35)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.description}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full border ${palette.ring} bg-slate-950/50 text-xs font-semibold ${palette.text}`}>
            {item.priority}
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-300" />
            <span className="font-medium text-slate-200">Deadline:</span>
            <span className="text-slate-300">{item.deadline || 'Flexible / Triggered'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-sky-300" />
            <span className="font-medium text-slate-200">Frequency:</span>
            <span className="text-slate-300">{item.frequency}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span className="font-medium text-slate-200">Responsible:</span>
            <span className="text-slate-300">{item.responsible}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-300" />
            <span className="font-medium text-slate-200">Type:</span>
            <span className="text-slate-300">{item.type}</span>
          </div>
        </div>

        {item.consequences && (
          <div className="relative rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.2em] text-rose-200">
              <AlertTriangle className="h-4 w-4" /> Consequences
            </div>
            <p className="mt-2 leading-relaxed text-rose-100/90">{item.consequences}</p>
          </div>
        )}

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {renderStatusBadge(status)}
            <select
              value={status}
              onChange={(event) => handleStatusChange(item.id, event.target.value as Status)}
              className="rounded-full bg-slate-900/70 border border-white/10 px-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2 text-slate-300">
              <StickyNote className="h-4 w-4 text-emerald-300" /> Intelligence notes
            </span>
            <textarea
              value={notesMap[item.id] || ''}
              onChange={(event) => handleNotesChange(item.id, event.target.value)}
              placeholder="Log context, commitments, or escalation paths..."
              className="min-h-[90px] resize-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </label>
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-sm text-slate-200">
            <thead className="bg-slate-900/80">
              <tr className="text-left">
                <th className="px-6 py-3">Section</th>
                <th className="px-6 py-3">Requirement</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Responsible</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition">
                  <td className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">{item.section}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-100">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.deadline || 'Flexible'}</td>
                  <td className="px-6 py-4 text-slate-300">{item.responsible}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${priorityAccent[item.priority].text.replace('text-', 'bg-')}`} />
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {renderStatusBadge(resolveStatus(item.id))}
                      <select
                        value={resolveStatus(item.id)}
                        onChange={(event) => handleStatusChange(item.id, event.target.value as Status)}
                        className="rounded-full bg-slate-900/70 border border-white/10 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/70 via-cyan-400/40 to-transparent" />
        <div className="space-y-8">
          {timelineItems.map((item) => {
            const status = resolveStatus(item.id);
            return (
              <div key={item.id} className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
                <div className="absolute -left-[29px] top-6 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border border-emerald-400/60">
                  <Calendar className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                      {resolveMonthForItem(item) ?? 'Flexible cadence'}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-100">{item.title}</h3>
                  </div>
                  {renderStatusBadge(status)}
                </div>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.description}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-sky-300" />
                    {item.frequency}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    {item.responsible}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const order = [...MONTHS, 'Flexible'];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {order.map((month) => {
          const items = calendarBuckets.get(month) || [];
          if (items.length === 0) return null;
          return (
            <div key={month} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">{month}</h3>
                <span className="text-sm text-slate-400">{items.length} obligations</span>
              </div>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <span className="text-xs text-slate-400">{item.priority}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{item.deadline || 'Flexible trigger'}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Completion velocity <Activity className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-semibold text-emerald-200">{completionRate}%</span>
              <span className="text-xs text-slate-400">{statusCounts.Completed} complete / {complianceItems.length}</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-900/60">
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Critical load <AlertTriangle className="h-4 w-4 text-rose-300" />
            </div>
            <div className="mt-4 text-4xl font-semibold text-rose-200">{activeCritical}</div>
            <p className="mt-2 text-xs text-slate-400">Critical obligations demanding immediate action.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Active oversight <Target className="h-4 w-4 text-amber-300" />
            </div>
            <div className="mt-4 text-4xl font-semibold text-amber-200">{filteredItems.length}</div>
            <p className="mt-2 text-xs text-slate-400">Focused obligations after filters &amp; presets.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Completed assurances <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 text-4xl font-semibold text-emerald-200">{statusCounts.Completed}</div>
            <p className="mt-2 text-xs text-slate-400">Verified obligations closed out.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Upcoming pressure points <Clock3 className="h-4 w-4 text-sky-300" />
            </div>
            <div className="mt-4 space-y-4">
              {upcomingHighlights.length === 0 && (
                <p className="text-sm text-slate-400">No timed obligations detected for current filters.</p>
              )}
              {upcomingHighlights.map(({ item, month, status }) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.responsible}</p>
                    </div>
                    <span className="text-xs text-slate-400">{month}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {renderStatusBadge(status)}
                    <span className="text-xs text-slate-400">{item.deadline || item.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
            <div className="flex items-center justify-between text-sm text-slate-400">
              Responsibility hotspots <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 space-y-4">
              {topParties.map(([party, count]) => (
                <div key={party} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <span className="text-sm text-slate-200">{party}</span>
                  <span className="text-xs text-slate-400">{count} items</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-slate-400">
              Priority distribution
              <div className="mt-3 space-y-2">
                {Object.entries(priorityCounts).map(([priority, count]) => (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-300">{priority}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-900/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
                        style={{ width: `${Math.max(8, (count / complianceItems.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => renderCard(item))}
        </div>
      );
    }

    if (viewMode === 'table') {
      return renderTableView();
    }

    if (viewMode === 'timeline') {
      return renderTimelineView();
    }

    if (viewMode === 'calendar') {
      return renderCalendarView();
    }

    return renderDashboard();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-12 lg:px-10">
        <Header
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onExport={handleExport}
          onImport={handleImport}
          onPrint={handlePrint}
          onShare={handleShare}
        />

        <Controls
          searchTerm={searchTerm}
          filterCategory={filterCategory}
          filterType={filterType}
          filterParty={filterParty}
          showHighPriority={showHighPriority}
          viewMode={viewMode}
          rolePreset={rolePreset}
          quickView={quickView}
          sortKey={sortKey}
          sortDir={sortDir}
          totalItems={dedupedItems.length}
          filteredCount={filteredItems.length}
          onSearchChange={setSearchTerm}
          onFilterCategoryChange={setFilterCategory}
          onFilterTypeChange={setFilterType}
          onFilterPartyChange={setFilterParty}
          onHighPriorityToggle={() => setShowHighPriority(!showHighPriority)}
          onViewModeChange={setViewMode}
          onRolePresetChange={setRolePreset}
          onQuickViewChange={setQuickView}
          onSortKeyChange={setSortKey}
          onSortDirChange={setSortDir}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,320px)] gap-8">
          <div className="space-y-8">
            {renderActiveView()}
            {filteredItems.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-12 text-center text-lg text-slate-300 shadow-xl">
                No requirements found. Adjust filters to reveal additional obligations.
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Status matrix</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                {statusOptions.map((status) => (
                  <div key={status} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusTint[status].dot}`} />
                      {status}
                    </span>
                    <span className="text-xs text-slate-400">{statusCounts[status] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Legend</h2>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" /> Critical priority trigger
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-400" /> High priority
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" /> Medium priority
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-slate-400" /> Low priority
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-300" /> Anchored deadline / cadence
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
