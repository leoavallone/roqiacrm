import { Building2, CheckSquare, DollarSign, Headphones, LogOut, Moon, Plus, ShieldCheck, Sun, UsersRound, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LoginView } from '../features/auth/LoginView';
import { CustomersView } from '../features/customers/CustomersView';
import { FinanceView } from '../features/finance/FinanceView';
import { TeamView } from '../features/team/TeamView';
import { TasksView } from '../features/tasks/TasksView';
import { TicketPortalView } from '../features/tickets/TicketPortalView';
import { TicketsView } from '../features/tickets/TicketsView';
import { UsersView } from '../features/users/UsersView';
import { daysUntil } from '../core/date';
import type { Creator } from '../core/types';
import { useAuth } from '../hooks/useAuth';
import { useCrmData } from '../hooks/useCrmData';
import roqiaSymbol from '../../favicon.png';
import './App.css';

type ViewKey = 'tickets' | 'customers' | 'tasks' | 'team' | 'finance' | 'users' | 'clientPortal';
type Theme = 'dark' | 'light';

const navigation = [
  { key: 'tickets', label: 'Chamados', icon: Headphones },
  { key: 'customers', label: 'Clientes', icon: Building2 },
  { key: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { key: 'team', label: 'Responsaveis', icon: UsersRound },
  { key: 'finance', label: 'Financeiro', icon: DollarSign },
  { key: 'users', label: 'Usuarios', icon: ShieldCheck },
] satisfies Array<{ key: ViewKey; label: string; icon: typeof Headphones }>;

export function App() {
  const auth = useAuth();
  const crm = useCrmData(auth.currentUser);
  const [activeView, setActiveView] = useState<ViewKey>('tickets');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('roqiacrm:theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  const metrics = useMemo(() => {
    const openTickets = crm.tickets.filter((ticket) => ticket.status !== 'Resolvido').length;
    const activeCustomers = crm.customers.filter((customer) => customer.status === 'Ativa').length;
    const overdueTasks = crm.tasks.filter((task) => task.status !== 'Concluida' && daysUntil(task.dueDate) < 0).length;
    const unassignedTickets = crm.tickets.filter((ticket) => ticket.status !== 'Resolvido' && !ticket.assignedToId).length;

    return { openTickets, activeCustomers, overdueTasks, unassignedTickets };
  }, [crm.tickets, crm.customers, crm.tasks]);

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

  const currentCreator: Creator = {
    id: auth.currentUser.id,
    name: auth.currentUser.name,
    email: auth.currentUser.email,
    role: auth.currentUser.role,
    customerId: auth.currentUser.customerId,
  };

  if (auth.currentUser.role !== 'admin') {
    return (
      <main className="app-shell app-shell--portal" data-theme={theme}>
        <TicketPortalView
          customers={crm.customers}
          currentUser={currentCreator}
          onBack={auth.logout}
          onCreate={crm.addTicket}
        />
      </main>
    );
  }

  if (activeView === 'clientPortal') {
    return (
      <main className="app-shell app-shell--portal" data-theme={theme}>
        <TicketPortalView
          customers={crm.customers}
          currentUser={currentCreator}
          onBack={() => setActiveView('tickets')}
          onCreate={crm.addTicket}
        />
      </main>
    );
  }

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
          {navigation.map((item) => {
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
              <span>{auth.currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
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
            <h1>Central de atendimento e assinaturas</h1>
          </div>
          <div className="topbar__actions">
            <button className="primary-action" type="button" onClick={() => setActiveView('clientPortal')}>
              <Plus size={18} aria-hidden="true" />
              Abrir chamado
            </button>
          </div>
        </header>

        <section className="metrics" aria-label="Indicadores">
          <article className="metric">
            <span>Chamados ativos</span>
            <strong>{metrics.openTickets}</strong>
          </article>
          <article className="metric">
            <span>Clientes ativos</span>
            <strong>{metrics.activeCustomers}</strong>
          </article>
          <article className="metric">
            <span>Sem responsavel</span>
            <strong>{metrics.unassignedTickets}</strong>
          </article>
          <article className="metric metric--attention">
            <span>Tarefas atrasadas</span>
            <strong>{metrics.overdueTasks}</strong>
          </article>
        </section>

        {activeView === 'tickets' && (
          <TicketsView
            customers={crm.customers}
            team={crm.team}
            tickets={crm.tickets}
            onAssigneeChange={crm.updateTicketAssignee}
            onStatusChange={crm.updateTicketStatus}
          />
        )}
        {activeView === 'customers' && (
          <CustomersView
            customers={crm.customers}
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
            onCreate={crm.addTask}
            onStatusChange={crm.updateTaskStatus}
          />
        )}
        {activeView === 'team' && (
          <TeamView
            team={crm.team}
            onCreate={crm.addTeamMember}
            onUpdate={crm.updateTeamMember}
            onDelete={crm.deleteTeamMember}
          />
        )}
        {activeView === 'finance' && <FinanceView customers={crm.customers} />}
        {activeView === 'users' && (
          <UsersView
            accounts={auth.accounts}
            customers={crm.customers}
            currentUserId={auth.currentUser.id}
            onCreate={auth.createAccount}
            onRoleChange={auth.updateAccountRole}
            onCustomerChange={auth.updateAccountCustomer}
          />
        )}
      </section>
    </main>
  );
}
