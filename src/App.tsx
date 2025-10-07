import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { complianceItems } from './data/complianceItems';
import { ViewMode, RolePreset, QuickView, SortKey, Status, AppState } from './types/compliance';
import { STORAGE_KEY } from './utils/constants';
import { Calendar } from 'lucide-react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showHighPriority, setShowHighPriority] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [rolePreset, setRolePreset] = useState<RolePreset>('all');
  const [quickView, setQuickView] = useState<QuickView>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({});
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: AppState = JSON.parse(raw);
        setStatusMap(parsed.statusMap || {});
        setNotesMap(parsed.notesMap || {});
        setTheme(parsed.theme || 'light');
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    const snapshot: Partial<AppState> = {
      statusMap,
      notesMap,
      theme,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [statusMap, notesMap, theme]);

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

  const filteredItems = useMemo(() => {
    let items = complianceItems.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.section.includes(searchTerm);

      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesParty =
        filterParty === 'all' ||
        item.responsible === filterParty ||
        (filterParty === 'MSGC (General Council)' && item.responsible && item.responsible.includes('MSGC')) ||
        (filterParty === 'MSAT' && item.responsible && item.responsible.includes('MSAT')) ||
        (filterParty === 'Minister; MSGC' && (item.category === 'Ministerial' || item.category === 'MSGC'));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesPriority = !showHighPriority || (showHighPriority && (item.priority === 'Critical' || item.priority === 'High'));

      return matchesSearch && matchesType && matchesParty && matchesCategory && matchesPriority;
    });

    if (quickView === 'overdue') {
      items = items.filter((i) => statusMap[i.id] === 'Overdue');
    } else if (quickView === 'completed') {
      items = items.filter((i) => statusMap[i.id] === 'Completed');
    } else if (quickView === 'critical') {
      items = items.filter((i) => i.priority === 'Critical');
    } else if (quickView === 'upcoming') {
      items = items.filter((i) => i.annualDate || i.cyclicDate);
    }

    const dirMul = sortDir === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const v = (key: SortKey) => {
        if (key === 'priority') {
          const rank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (rank[a.priority] || 0) - (rank[b.priority] || 0);
        } else if (key === 'title') {
          return a.title.localeCompare(b.title);
        } else if (key === 'category') {
          return a.category.localeCompare(b.category);
        } else if (key === 'type') {
          return a.type.localeCompare(b.type);
        } else if (key === 'deadline') {
          return (a.deadline || '').localeCompare(b.deadline || '');
        } else {
          return 0;
        }
      };
      return v(sortKey) * dirMul;
    });

    return items;
  }, [complianceItems, searchTerm, filterType, filterParty, filterCategory, showHighPriority, quickView, sortKey, sortDir, statusMap]);

  const handleThemeToggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleExport = () => {
    alert('Export functionality - CSV and JSON exports available');
  };

  const handleImport = () => {
    alert('Import functionality - Import JSON data');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
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
          onRolePresetChange={setRolePreset}
          onQuickViewChange={setQuickView}
          onSortKeyChange={setSortKey}
          onSortDirChange={setSortDir}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Critical Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Annual/Cyclic Deadline</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg p-6 border-l-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow hover:shadow-lg transition-shadow ${
                item.priority === 'Critical'
                  ? 'border-l-red-500'
                  : item.priority === 'High'
                  ? 'border-l-amber-500'
                  : item.priority === 'Medium'
                  ? 'border-l-green-500'
                  : 'border-l-gray-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                      § {item.section}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${item.type === 'Meeting' ? 'bg-blue-100 text-blue-800' : item.type === 'Financial' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Deadline:</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.deadline}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.frequency}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Responsible:</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.responsible}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                  <span
                    className={`font-medium ${
                      item.priority === 'Critical'
                        ? 'text-red-600'
                        : item.priority === 'High'
                        ? 'text-amber-600'
                        : item.priority === 'Medium'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>

              {item.consequences && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">Consequences:</div>
                  <div className="text-xs text-red-700 dark:text-red-400">{item.consequences}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700 shadow">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No requirements found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
