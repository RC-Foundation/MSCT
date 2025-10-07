import { JSX } from 'react';
import { Search, Filter, Users, ListChecks, LayoutGrid, Table2, CalendarClock, CalendarDays, Radar } from 'lucide-react';
import { FILTER_OPTIONS } from '../utils/constants';
import { ViewMode, RolePreset, QuickView, SortKey } from '../types/compliance';

interface ControlsProps {
  searchTerm: string;
  filterCategory: string;
  filterType: string;
  filterParty: string;
  showHighPriority: boolean;
  viewMode: ViewMode;
  rolePreset: RolePreset;
  quickView: QuickView;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  totalItems: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onFilterCategoryChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
  onFilterPartyChange: (value: string) => void;
  onHighPriorityToggle: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRolePresetChange: (preset: RolePreset) => void;
  onQuickViewChange: (view: QuickView) => void;
  onSortKeyChange: (key: SortKey) => void;
  onSortDirChange: (dir: 'asc' | 'desc') => void;
}

const viewModeLabels: Record<ViewMode, string> = {
  grid: 'Grid',
  table: 'Table',
  timeline: 'Timeline',
  calendar: 'Calendar',
  dashboard: 'Dashboard',
};

const viewModeIcons: Record<ViewMode, JSX.Element> = {
  grid: <LayoutGrid className="w-4 h-4" />,
  table: <Table2 className="w-4 h-4" />,
  timeline: <CalendarClock className="w-4 h-4" />,
  calendar: <CalendarDays className="w-4 h-4" />,
  dashboard: <Radar className="w-4 h-4" />,
};

export const Controls = ({
  searchTerm,
  filterCategory,
  filterType,
  filterParty,
  showHighPriority,
  viewMode,
  rolePreset,
  quickView,
  sortKey,
  sortDir,
  totalItems,
  filteredCount,
  onSearchChange,
  onFilterCategoryChange,
  onFilterTypeChange,
  onFilterPartyChange,
  onHighPriorityToggle,
  onViewModeChange,
  onRolePresetChange,
  onQuickViewChange,
  onSortKeyChange,
  onSortDirChange,
}: ControlsProps) => {
  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 mb-10">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requirements, sections, obligations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={filterCategory}
              onChange={(e) => onFilterCategoryChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 appearance-none"
            >
              {FILTER_OPTIONS.categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 appearance-none"
            >
              {FILTER_OPTIONS.types.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={filterParty}
              onChange={(e) => onFilterPartyChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 appearance-none"
            >
              {FILTER_OPTIONS.parties.map((party) => (
                <option key={party} value={party}>
                  {party === 'all' ? 'All Parties' : party}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              Showing {filteredCount} of {totalItems} obligations
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10">
              <ListChecks className="w-4 h-4 text-emerald-300" />
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span>High priority focus</span>
                <span className="relative">
                  <input
                    type="checkbox"
                    checked={showHighPriority}
                    onChange={onHighPriorityToggle}
                    className="peer sr-only"
                  />
                  <span className="block h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-emerald-500 transition" />
                  <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${
                  viewMode === mode
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                {viewModeIcons[mode]}
                {viewModeLabels[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-sm text-slate-300">Role preset</span>
            <select
              value={rolePreset}
              onChange={(e) => onRolePresetChange(e.target.value as RolePreset)}
              className="flex-1 bg-transparent border-none text-slate-100 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="council">Settlement Council</option>
              <option value="administrator">Administrator</option>
              <option value="registrar">MSLR Registrar</option>
              <option value="msgc">MSGC</option>
              <option value="msat">MSAT</option>
              <option value="minister">Minister</option>
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-sm text-slate-300">Quick view</span>
            <select
              value={quickView}
              onChange={(e) => onQuickViewChange(e.target.value as QuickView)}
              className="flex-1 bg-transparent border-none text-slate-100 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-sm text-slate-300">Sort order</span>
            <select
              value={sortKey}
              onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
              className="flex-1 bg-transparent border-none text-slate-100 focus:outline-none"
            >
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="deadline">Deadline</option>
              <option value="type">Type</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => onSortDirChange(e.target.value as 'asc' | 'desc')}
              className="bg-transparent border-none text-slate-100 focus:outline-none"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
