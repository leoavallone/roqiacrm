import { useMemo, useState } from 'react';
import { clearSession, loadAccounts, loadSession, saveAccounts, saveSession } from '../core/auth';
import type { UserAccount } from '../core/types';

type LoginResult = { ok: true } | { ok: false; message: string };

export function useAuth() {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAccounts());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadSession());

  const currentUser = useMemo(
    () => accounts.find((account) => account.id === currentUserId) ?? null,
    [accounts, currentUserId],
  );

  function login(email: string, password: string): LoginResult {
    const account = accounts.find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
    );

    if (!account) {
      return { ok: false, message: 'E-mail ou senha invalidos.' };
    }

    saveSession(account.id);
    setCurrentUserId(account.id);
    return { ok: true };
  }

  function createAccount(account: Omit<UserAccount, 'id'>): LoginResult {
    const emailAlreadyExists = accounts.some((candidate) => candidate.email.toLowerCase() === account.email.toLowerCase());

    if (emailAlreadyExists) {
      return { ok: false, message: 'Ja existe uma conta com esse e-mail.' };
    }

    const userAccount: UserAccount = {
      ...account,
      id: crypto.randomUUID(),
    };
    const nextAccounts = [userAccount, ...accounts];
    saveAccounts(nextAccounts);
    setAccounts(nextAccounts);
    return { ok: true };
  }

  function updateAccountRole(accountId: string, role: UserAccount['role']) {
    const nextAccounts = accounts.map((account) => (account.id === accountId ? { ...account, role } : account));
    saveAccounts(nextAccounts);
    setAccounts(nextAccounts);
  }

  function updateAccountCustomer(accountId: string, customerId: string) {
    const nextAccounts = accounts.map((account) => (account.id === accountId ? { ...account, customerId } : account));
    saveAccounts(nextAccounts);
    setAccounts(nextAccounts);
  }

  function logout() {
    clearSession();
    setCurrentUserId(null);
  }

  return { accounts, currentUser, login, createAccount, updateAccountRole, updateAccountCustomer, logout };
}
