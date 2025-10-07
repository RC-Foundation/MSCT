import { Search, Filter, Users, ListChecks } from 'lucide-react';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            {FILTER_OPTIONS.categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            {FILTER_OPTIONS.types.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select
            value={filterParty}
            onChange={(e) => onFilterPartyChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            {FILTER_OPTIONS.parties.map((party) => (
              <option key={party} value={party}>
                {party === 'all' ? 'All Parties' : party}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <div className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showHighPriority}
                onChange={onHighPriorityToggle}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600">
                <div className="absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
              </div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">High Priority Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCount} of {totalItems} requirements
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </button>
          <button
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => onViewModeChange('table')}
          >
            Table
          </button>
          <button
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => onViewModeChange('timeline')}
          >
            Timeline
          </button>
          <button
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => onViewModeChange('calendar')}
          >
            Calendar
          </button>
          <button
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => onViewModeChange('dashboard')}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Role preset:</span>
          <select
            value={rolePreset}
            onChange={(e) => onRolePresetChange(e.target.value as RolePreset)}
            className="px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Quick view:</span>
          <select
            value={quickView}
            onChange={(e) => onQuickViewChange(e.target.value as QuickView)}
            className="px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
            className="px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
            className="px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>
    </div>
  );
};
