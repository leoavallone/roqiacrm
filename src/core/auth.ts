import type { UserAccount } from './types';

const ACCOUNTS_KEY = 'roqiacrm:accounts:v1';
const SESSION_KEY = 'roqiacrm:session:v1';

const defaultAccounts: UserAccount[] = [
  {
    id: 'user-admin-1',
    name: 'Admin RoqIA',
    email: 'admin@roqia.com',
    password: 'admin123',
    role: 'admin',
  },
];

export function loadAccounts(): UserAccount[] {
  const rawAccounts = window.localStorage.getItem(ACCOUNTS_KEY);

  if (!rawAccounts) {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }

  try {
    const accounts = JSON.parse(rawAccounts) as UserAccount[];
    const hasDefaultAdmin = accounts.some((account) => account.email.toLowerCase() === defaultAccounts[0].email);
    const normalizedAccounts = hasDefaultAdmin ? accounts : [defaultAccounts[0], ...accounts];
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(normalizedAccounts));
    return normalizedAccounts;
  } catch {
    return defaultAccounts;
  }
}

export function saveAccounts(accounts: UserAccount[]): void {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function loadSession(): string | null {
  return window.localStorage.getItem(SESSION_KEY);
}

export function saveSession(userId: string): void {
  window.localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
