import { useState, useMemo, useEffect, useRef, ChangeEvent } from 'react';
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
  FilterState,
} from './types/compliance';
import { STORAGE_KEY, SHARE_QUERY_KEY } from './utils/constants';
import { downloadItemsToCalendar, downloadItemToCalendar } from './utils/ics';
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
  CalendarPlus,
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

const defaultFilters: FilterState = {
  searchTerm: '',
  filterType: 'all',
  filterParty: 'all',
  filterCategory: 'all',
  showHighPriority: false,
  viewMode: 'dashboard',
  rolePreset: 'all',
  quickView: 'all',
  sortKey: 'priority',
  sortDir: 'desc',
};

type ToastTone = 'info' | 'success' | 'error';

interface ToastMessage {
  text: string;
  tone: ToastTone;
  link?: string;
}

const encodeStatePayload = (state: AppState) => {
  const encoder = new TextEncoder();
  const json = JSON.stringify(state);
  const bytes = encoder.encode(json);
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return encodeURIComponent(btoa(binary));
};

const decodeStatePayload = (payload: string): AppState => {
  const decoder = new TextDecoder();
  const binary = atob(decodeURIComponent(payload));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = decoder.decode(bytes);
  return JSON.parse(json) as AppState;
};

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

function App() {
  const [searchTerm, setSearchTerm] = useState(defaultFilters.searchTerm);
  const [filterType, setFilterType] = useState(defaultFilters.filterType);
  const [filterParty, setFilterParty] = useState(defaultFilters.filterParty);
  const [filterCategory, setFilterCategory] = useState(defaultFilters.filterCategory);
  const [showHighPriority, setShowHighPriority] = useState(defaultFilters.showHighPriority);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultFilters.viewMode);
  const [rolePreset, setRolePreset] = useState<RolePreset>(defaultFilters.rolePreset);
  const [quickView, setQuickView] = useState<QuickView>(defaultFilters.quickView);
  const [sortKey, setSortKey] = useState<SortKey>(defaultFilters.sortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultFilters.sortDir);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({});
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const applyFilters = (filters?: Partial<FilterState>) => {
    const merged: FilterState = { ...defaultFilters, ...(filters ?? {}) };
    setSearchTerm(merged.searchTerm);
    setFilterType(merged.filterType);
    setFilterParty(merged.filterParty);
    setFilterCategory(merged.filterCategory);
    setShowHighPriority(merged.showHighPriority);
    setViewMode(merged.viewMode);
    setRolePreset(merged.rolePreset);
    setQuickView(merged.quickView);
    setSortKey(merged.sortKey);
    setSortDir(merged.sortDir);
  };

  const buildStateSnapshot = (): AppState => ({
    statusMap,
    notesMap,
    theme,
    filters: {
      searchTerm,
      filterType,
      filterParty,
      filterCategory,
      showHighPriority,
      viewMode,
      rolePreset,
      quickView,
      sortKey,
      sortDir,
    },
    generatedAt: new Date().toISOString(),
  });

  const pushToast = (message: string, tone: ToastTone = 'info', link?: string) => {
    setToast({ text: message, tone, link });
    if (link) {
      setShareUrl(link);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const applyImportedState = (state?: Partial<AppState>) => {
    if (!state) {
      setStatusMap({});
      setNotesMap({});
      applyFilters();
      setTheme('dark');
      return;
    }

    setStatusMap(state.statusMap ?? {});
    setNotesMap(state.notesMap ?? {});
    if (state.theme) {
      setTheme(state.theme);
    }
    if (state.filters) {
      applyFilters(state.filters);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get(SHARE_QUERY_KEY);

    if (sharedPayload) {
      try {
        const parsed = decodeStatePayload(sharedPayload);
        applyImportedState(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        const url = `${window.location.origin}${window.location.pathname}?${SHARE_QUERY_KEY}=${sharedPayload}`;
        pushToast('Loaded shared workspace snapshot.', 'success', url);
      } catch (error) {
        console.error('Failed to parse shared workspace', error);
        pushToast('Unable to load shared workspace link.', 'error');
      }

      params.delete(SHARE_QUERY_KEY);
      const query = params.toString();
      const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: AppState = JSON.parse(raw);
        applyImportedState(parsed);
      } catch (error) {
        console.error('Failed to load state from localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    const snapshot = buildStateSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    statusMap,
    notesMap,
    theme,
    searchTerm,
    filterType,
    filterParty,
    filterCategory,
    showHighPriority,
    viewMode,
    rolePreset,
    quickView,
    sortKey,
    sortDir,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const resolveStatus = (id: number) => statusMap[id] || defaultStatus;

  const filteredItems = useMemo(() => {
    let items = complianceItems.filter((item) => {
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

  const handleThemeToggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleExport = () => {
    try {
      const snapshot = buildStateSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      anchor.href = url;
      anchor.download = `msct-workspace-${timestamp}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      pushToast('Workspace exported as JSON.', 'success');
    } catch (error) {
      console.error('Export failed', error);
      pushToast('Export failed. Please try again.', 'error');
    }
  };

  const handleImport = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const parsed = JSON.parse(content) as AppState;
        applyImportedState(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        pushToast('Workspace imported successfully.', 'success');
      } catch (error) {
        console.error('Failed to import workspace', error);
        pushToast('Import failed. Ensure the file is a valid workspace export.', 'error');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWorkspace = async () => {
    try {
      const snapshot = buildStateSnapshot();
      const encoded = encodeStatePayload(snapshot);
      const url = `${window.location.origin}${window.location.pathname}?${SHARE_QUERY_KEY}=${encoded}`;
      setShareUrl(url);

      if (navigator.share) {
        try {
          await navigator.share({ title: 'MSCT workspace', url });
          pushToast('Share sheet opened. Send the link to your collaborators.', 'success', url);
          return;
        } catch (error) {
          console.warn('Native share cancelled or failed', error);
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        pushToast('Shareable link copied to clipboard.', 'success', url);
      } catch (error) {
        console.error('Clipboard copy failed', error);
        pushToast('Shareable link ready below.', 'info', url);
      }
    } catch (error) {
      console.error('Failed to create share link', error);
      pushToast('Unable to generate a share link.', 'error');
    }
  };

  const handleResetWorkspace = () => {
    applyImportedState(undefined);
    localStorage.removeItem(STORAGE_KEY);
    setShareUrl(null);
    pushToast('Workspace reset. Local changes cleared.', 'success');
  };

  const handleCalendarDownload = () => {
    const success = downloadItemsToCalendar(
      filteredItems,
      statusMap,
      notesMap,
      window.location.href,
      'msct-schedule',
    );

    if (success) {
      pushToast('Downloaded calendar file for the current view.', 'success');
    } else {
      pushToast('No items available to export for the calendar.', 'info');
    }
  };

  const handleItemCalendarDownload = (item: ComplianceItem) => {
    const success = downloadItemToCalendar(
      item,
      statusMap,
      notesMap,
      window.location.href,
      `msct-item-${item.id}`,
    );

    if (success) {
      pushToast(`Calendar entry generated for "${item.title}".`, 'success');
    } else {
      pushToast('Unable to generate a calendar entry for this requirement.', 'error');
    }
  };

  const handleRolePresetChange = (preset: RolePreset) => {
    setRolePreset(preset);
    if (preset === 'all') {
      setFilterParty('all');
    } else if (preset === 'council') {
      setFilterParty('Settlement Council');
    } else if (preset === 'administrator') {
      setFilterParty('Settlement Administrator');
    } else if (preset === 'registrar') {
      setFilterParty('MSLR Registrar');
    } else if (preset === 'msgc') {
      setFilterParty('MSGC (General Council)');
    } else if (preset === 'msat') {
      setFilterParty('MSAT');
    } else if (preset === 'minister') {
      setFilterParty('Minister; MSGC');
    }
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <button
              onClick={() => handleItemCalendarDownload(item)}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> Add to calendar
            </button>
          </div>
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
                <div className="mt-4">
                  <button
                    onClick={() => handleItemCalendarDownload(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" /> Add to calendar
                  </button>
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
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportFile}
        />
        <Header
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onExport={handleExport}
          onImport={handleImport}
          onPrint={handlePrint}
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
          totalItems={complianceItems.length}
          filteredCount={filteredItems.length}
          onSearchChange={setSearchTerm}
          onFilterCategoryChange={setFilterCategory}
          onFilterTypeChange={setFilterType}
          onFilterPartyChange={setFilterParty}
          onHighPriorityToggle={() => setShowHighPriority(!showHighPriority)}
          onViewModeChange={setViewMode}
          onRolePresetChange={handleRolePresetChange}
          onQuickViewChange={setQuickView}
          onSortKeyChange={setSortKey}
          onSortDirChange={setSortDir}
          onShareWorkspace={handleShareWorkspace}
          onDownloadCalendar={handleCalendarDownload}
          onResetWorkspace={handleResetWorkspace}
          statusMessage={toast}
          shareUrl={shareUrl}
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
