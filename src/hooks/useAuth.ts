import { useEffect, useMemo, useState } from 'react';
import { clearAuthToken, createUser, fetchCurrentUser, fetchUsers, loadAuthToken, loginWithApi, saveAuthToken, updateUser } from '../core/api';
import type { UserAccount } from '../core/types';

type LoginResult = { ok: true } | { ok: false; message: string };

export function useAuth() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => loadAuthToken());
  const [isRestoringSession, setIsRestoringSession] = useState(Boolean(token));

  const currentUser = useMemo(
    () => accounts.find((account) => account.id === currentUserId) ?? null,
    [accounts, currentUserId],
  );

  useEffect(() => {
    if (!token) {
      setIsRestoringSession(false);
      return;
    }

    let isMounted = true;
    const activeToken = token;

    async function restoreSession() {
      try {
        const user = await fetchCurrentUser(activeToken);
        const users = user.role === 'admin' ? await fetchUsers() : [user];

        if (!isMounted) {
          return;
        }

        setAccounts(mergeAccounts(users, user));
        setCurrentUserId(user.id);
      } catch {
        clearAuthToken();

        if (isMounted) {
          setToken(null);
          setAccounts([]);
          setCurrentUserId(null);
        }
      } finally {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(email: string, password: string): Promise<LoginResult> {
    try {
      const result = await loginWithApi(email, password);
      saveAuthToken(result.token);
      setToken(result.token);
      setAccounts(result.user.role === 'admin' ? await fetchUsers() : [result.user]);
      setCurrentUserId(result.user.id);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) };
    }
  }

  async function createAccount(account: Omit<UserAccount, 'id'>): Promise<LoginResult> {
    try {
      const userAccount = await createUser(account);
      setAccounts((current) => [userAccount, ...current]);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) };
    }
  }

  async function updateAccountRole(accountId: string, role: UserAccount['role']) {
    const updatedUser = await updateUser(accountId, { role });
    setAccounts((current) => current.map((account) => (account.id === accountId ? updatedUser : account)));
  }

  async function updateAccountCustomer(accountId: string, customerId: string) {
    const updatedUser = await updateUser(accountId, { customerId });
    setAccounts((current) => current.map((account) => (account.id === accountId ? updatedUser : account)));
  }

  function logout() {
    clearAuthToken();
    setToken(null);
    setAccounts([]);
    setCurrentUserId(null);
  }

  return { accounts, currentUser, isRestoringSession, login, createAccount, updateAccountRole, updateAccountCustomer, logout };
}

function mergeAccounts(accounts: UserAccount[], currentUser: UserAccount): UserAccount[] {
  return accounts.some((account) => account.id === currentUser.id) ? accounts : [currentUser, ...accounts];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Nao foi possivel comunicar com o servidor.';
}
