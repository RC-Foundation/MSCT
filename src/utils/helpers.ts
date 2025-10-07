import { ComplianceItem } from '../types/compliance';

export const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Meeting: 'bg-blue-100 text-blue-800',
    Election: 'bg-purple-100 text-purple-800',
    Procedural: 'bg-green-100 text-green-800',
    Documentation: 'bg-yellow-100 text-yellow-800',
    Financial: 'bg-red-100 text-red-800',
    Planning: 'bg-sky-100 text-sky-800',
    Reporting: 'bg-orange-100 text-orange-800',
    Legislative: 'bg-pink-100 text-pink-800',
    Notice: 'bg-teal-100 text-teal-800',
    Review: 'bg-amber-100 text-amber-800',
    Compliance: 'bg-cyan-100 text-cyan-800',
    Adjudication: 'bg-fuchsia-100 text-fuchsia-800',
    Administrative: 'bg-lime-100 text-lime-800',
    Legal: 'bg-rose-100 text-rose-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    Critical: 'border-red-500 bg-red-50',
    High: 'border-amber-500 bg-amber-50',
    Medium: 'border-green-500 bg-green-50',
    Low: 'border-gray-500 bg-gray-50',
  };
  return colors[priority] || 'border-gray-200 bg-gray-50';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Pending: 'bg-gray-100 text-gray-800 border-gray-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    Completed: 'bg-green-100 text-green-800 border-green-300',
    Overdue: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const normalizeAnnualDate = (annualDate: string): string => {
  const months: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };
  const parts = annualDate.split(' ');
  if (parts.length >= 2) {
    const m = months[parts[0].toLowerCase()] || '01';
    const dRaw = parts[1].replace(/[^0-9]/g, '');
    const d = dRaw.padStart(2, '0');
    return `${m}-${d}`;
  }
  return '06-30';
};

export const groupByCategory = (items: ComplianceItem[]): Record<string, ComplianceItem[]> => {
  return items.reduce((acc, cur) => {
    if (!acc[cur.category]) {
      acc[cur.category] = [];
    }
    acc[cur.category].push(cur);
    return acc;
  }, {} as Record<string, ComplianceItem[]>);
};

export const exportToCSV = (
  items: ComplianceItem[],
  statusMap: Record<number, string>,
  notesMap: Record<number, string>
): string => {
  const headers = [
    'id',
    'category',
    'section',
    'title',
    'description',
    'deadline',
    'frequency',
    'type',
    'priority',
    'responsible',
    'action',
    'consequences',
    'trigger',
    'cyclicDate',
    'annualDate',
    'financialYear',
    'relatedSections',
    'status',
    'notes',
  ];

  const rows = items.map((i) => {
    return [
      i.id,
      i.category,
      i.section,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${(i.deadline || '').replace(/"/g, '""')}"`,
      i.frequency || '',
      i.type || '',
      i.priority || '',
      `"${(i.responsible || '').replace(/"/g, '""')}"`,
      `"${(i.action || '').replace(/"/g, '""')}"`,
      `"${(i.consequences || '').replace(/"/g, '""')}"`,
      `"${(i.trigger || '').replace(/"/g, '""')}"`,
      i.cyclicDate || '',
      i.annualDate || '',
      i.financialYear ? 'true' : 'false',
      `"${(i.relatedSections || []).join(';').replace(/"/g, '""')}"`,
      statusMap[i.id] || 'Pending',
      `"${(notesMap[i.id] || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const triggerDownload = (url: string, filename: string): void => {
  const linkEl = document.createElement('a');
  linkEl.href = url;
  linkEl.download = filename;
  linkEl.click();
  URL.revokeObjectURL(url);
};
