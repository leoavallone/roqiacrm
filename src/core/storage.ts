import type { CrmData } from './types';

const STORAGE_KEY = 'roqiacrm:data:v4';
const LEGACY_STORAGE_KEYS = ['roqiacrm:data:v3', 'roqiacrm:data:v2', 'roqiacrm:data:v1'];

export function loadCrmData(initialData: CrmData): CrmData {
  const rawData = window.localStorage.getItem(STORAGE_KEY) ?? LEGACY_STORAGE_KEYS
    .map((key) => window.localStorage.getItem(key))
    .find(Boolean);

  if (!rawData) {
    return initialData;
  }

  try {
    return normalizeCrmData(JSON.parse(rawData) as CrmData, initialData);
  } catch {
    return initialData;
  }
}

export function saveCrmData(data: CrmData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeCrmData(data: CrmData, initialData: CrmData): CrmData {
  return {
    ...initialData,
    ...data,
    tickets: data.tickets.map((ticket, index) => ({
      ...ticket,
      number: ticket.number ?? 1001 + index,
      createdBy: ticket.createdBy ?? {
        id: 'system',
        name: 'Sistema',
        email: 'sistema@roqia.com',
        role: 'admin',
      },
      assignedToId: ticket.assignedToId,
      history: ticket.history ?? [
        {
          id: `${ticket.id}-history-opened`,
          date: ticket.createdAt,
          title: 'Chamado aberto',
          description: ticket.description,
        },
      ],
    })),
    tasks: data.tasks.map((task) => ({
      ...task,
      type: task.type ?? (task.customerName ? 'Cliente' : 'RoqIA'),
      createdBy: task.createdBy ?? {
        id: 'system',
        name: 'Sistema',
        email: 'sistema@roqia.com',
        role: 'admin',
      },
    })),
  };
}
