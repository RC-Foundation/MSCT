export interface ComplianceItem {
  id: number;
  category: string;
  section: string;
  title: string;
  description: string;
  deadline: string;
  frequency: string;
  type: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  responsible: string;
  action: string;
  consequences: string;
  trigger?: string;
  cyclicDate?: string;
  annualDate?: string;
  financialYear?: boolean;
  relatedSections?: string[];
}

export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export type ViewMode = 'grid' | 'table' | 'timeline' | 'calendar' | 'dashboard';

export type RolePreset = 'all' | 'council' | 'administrator' | 'registrar' | 'msgc' | 'msat' | 'minister';

export type QuickView = 'all' | 'upcoming' | 'overdue' | 'completed' | 'critical';

export type SortKey = 'priority' | 'title' | 'category' | 'deadline' | 'type';

export interface Attachment {
  name: string;
  size: number;
  type: string;
}

export interface Reminder {
  itemId: number;
  label: string;
  date: string;
}

export interface AuditLogEntry {
  ts: string;
  action: string;
  itemId: number;
  details: string;
}

export interface FilterState {
  searchTerm: string;
  filterType: string;
  filterParty: string;
  filterCategory: string;
  showHighPriority: boolean;
  viewMode: ViewMode;
  rolePreset: RolePreset;
  quickView: QuickView;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
}

export interface AppState {
  statusMap?: Record<number, Status>;
  notesMap?: Record<number, string>;
  auditLog?: AuditLogEntry[];
  attachmentsMap?: Record<number, Attachment[]>;
  reminderList?: Reminder[];
  theme?: 'light' | 'dark';
  filters?: FilterState;
  generatedAt?: string;
}
