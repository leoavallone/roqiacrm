import { Building2, CheckSquare, DollarSign, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LoginView } from '../features/auth/LoginView';
import { CustomersView } from '../features/customers/CustomersView';
import { FinanceView } from '../features/finance/FinanceView';
import { TasksView } from '../features/tasks/TasksView';
import { daysUntil } from '../core/date';
import type { Creator } from '../core/types';
import { useAuth } from '../hooks/useAuth';
import { useCrmData } from '../hooks/useCrmData';
import roqiaSymbol from '../../favicon.png';
import './App.css';

type ViewKey = 'tasks' | 'customers' | 'finance';
type Theme = 'dark' | 'light';

const navigation = [
  { key: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { key: 'customers', label: 'Clientes', icon: Building2 },
  { key: 'finance', label: 'Financeiro', icon: DollarSign },
] satisfies Array<{ key: ViewKey; label: string; icon: typeof CheckSquare }>;

const viewTitles: Record<ViewKey, string> = {
  tasks: 'Gestão de tarefas',
  customers: 'Gestão de clientes e contratos',
  finance: 'Gestão de finanças',
};

export function App() {
  const auth = useAuth();
  const crm = useCrmData(auth.currentUser);
  const [activeView, setActiveView] = useState<ViewKey>('tasks');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('roqiacrm:theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  const metrics = useMemo(() => {
    const activeCustomers = crm.customers.filter((customer) => customer.status === 'Ativa').length;
    const inactiveCustomers = crm.customers.filter((customer) => customer.status === 'Inativo').length;
    const pendingTasks = crm.tasks.filter((task) => task.status !== 'Concluida').length;
    const overdueTasks = crm.tasks.filter((task) => task.status !== 'Concluida' && daysUntil(task.dueDate) < 0).length;

    return { activeCustomers, inactiveCustomers, pendingTasks, overdueTasks };
  }, [crm.customers, crm.tasks]);

  function changeTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem('roqiacrm:theme', nextTheme);
  }

  if (!auth.currentUser) {
    if (auth.isRestoringSession) {
      return (
        <main className="login-shell app-shell" data-theme="dark">
          <section className="login-panel">
            <p>Carregando sessao...</p>
          </section>
        </main>
      );
    }

    return <LoginView onLogin={auth.login} />;
  }

  const isSuperAdmin = auth.currentUser.role === 'superAdmin';
  const isAdmin = auth.currentUser.role === 'admin';
  const canSeeCustomers = isSuperAdmin || isAdmin;
  const canSeeFinance = isSuperAdmin || isAdmin;
  const availableNavigation = navigation.filter((item) => {
    if (item.key === 'customers') return canSeeCustomers;
    if (item.key === 'finance') return canSeeFinance;
    return true;
  });

  const currentCreator: Creator = {
    id: auth.currentUser.id,
    name: auth.currentUser.name,
    email: auth.currentUser.email,
    role: auth.currentUser.role,
    customerId: auth.currentUser.customerId,
  };

  return (
    <main className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">
            <img className="brand__logo" src={roqiaSymbol} alt="RoqIA" />
          </div>
          <div>
            <strong>RoqIA CRM</strong>
            <span>Gestao operacional</span>
          </div>
        </div>

        <div className="theme-switcher" role="group" aria-label="Tema da interface">
          <button
            aria-pressed={theme === 'dark'}
            className={theme === 'dark' ? 'theme-switcher__button theme-switcher__button--active' : 'theme-switcher__button'}
            type="button"
            onClick={() => changeTheme('dark')}
            title="Tema escuro"
          >
            <Moon size={16} aria-hidden="true" />
            Escuro
          </button>
          <button
            aria-pressed={theme === 'light'}
            className={theme === 'light' ? 'theme-switcher__button theme-switcher__button--active' : 'theme-switcher__button'}
            type="button"
            onClick={() => changeTheme('light')}
            title="Tema claro"
          >
            <Sun size={16} aria-hidden="true" />
            Claro
          </button>
        </div>

        <nav className="navigation" aria-label="Navegacao principal">
          {availableNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.key ? 'navigation__item navigation__item--active' : 'navigation__item'}
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="team-box">
          <span className="team-box__label">Usuario logado</span>
          <div className="team-member">
            <UserRound size={16} aria-hidden="true" />
            <div>
              <strong>{auth.currentUser.name}</strong>
              <span>{getRoleLabel(auth.currentUser.role)}</span>
            </div>
          </div>
          <button className="secondary-action" type="button" onClick={auth.logout}>
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">RoqIA CRM</p>
            <h1>{viewTitles[activeView]}</h1>
          </div>
        </header>

        <section className="metrics" aria-label="Indicadores">
          <article className="metric">
            <span>Tarefas pendentes</span>
            <strong>{metrics.pendingTasks}</strong>
          </article>
          <article className="metric">
            <span>Clientes ativos</span>
            <strong>{metrics.activeCustomers}</strong>
          </article>
          <article className="metric">
            <span>Clientes inativos</span>
            <strong>{metrics.inactiveCustomers}</strong>
          </article>
          <article className="metric metric--attention">
            <span>Tarefas atrasadas</span>
            <strong>{metrics.overdueTasks}</strong>
          </article>
        </section>

        {activeView === 'customers' && canSeeCustomers && (
          <CustomersView
            customers={crm.customers}
            readOnly={!isSuperAdmin}
            onCreate={crm.addCustomer}
            onUpdate={crm.updateCustomer}
            onDelete={crm.deleteCustomer}
          />
        )}
        {activeView === 'tasks' && (
          <TasksView
            customers={crm.customers}
            tasks={crm.tasks}
            team={crm.team}
            currentUser={currentCreator}
            canCreate={isSuperAdmin || isAdmin}
            canAssign={isSuperAdmin || isAdmin}
            onCreate={crm.addTask}
            onStatusChange={crm.updateTaskStatus}
            onOwnerChange={crm.updateTaskOwner}
          />
        )}
        {activeView === 'finance' && canSeeFinance && (
          <FinanceView
            transactions={crm.financeTransactions}
            onCreate={crm.addFinanceTransaction}
            onDelete={crm.deleteFinanceTransaction}
          />
        )}
      </section>
    </main>
  );
}

function getRoleLabel(role: Creator['role']) {
  const labels: Record<Creator['role'], string> = {
    superAdmin: 'Super admin',
    admin: 'Admin parceria',
    collaborator: 'Colaborador',
    client: 'Cliente',
  };

  return labels[role];
}
