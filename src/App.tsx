import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPageView } from './components/LandingPageView';
import { DashboardView } from './components/DashboardView';
import { ThreatLabView } from './components/ThreatLabView';
import { RiskCheckView } from './components/RiskCheckView';
import { ScamAnalyzerView } from './components/ScamAnalyzerView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetView } from './components/BudgetView';
import { AnalyticsView } from './components/AnalyticsView';
import { SecurityAlertsView } from './components/SecurityAlertsView';
import { SchemaAnalyzerView } from './components/SchemaAnalyzerView';
import { ProfileView } from './components/ProfileView';
//import { CodeStationModal } from './components/CodeStationModal';
import { AuthModal } from './components/AuthModal';
import { 
  INITIAL_USER, 
  INITIAL_ACCOUNTS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_ALERTS, 
  INITIAL_BUDGETS 
} from './data/mockData';
import { User, Account, Category, Transaction, SecurityAlert, Budget } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isCodeStationOpen, setIsCodeStationOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // User state - defaults to null or stored user
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('finguardUser');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USER;
  });

  // Financial & Security States
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [budget, setBudget] = useState<Budget>(INITIAL_BUDGETS[0]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('finguardUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('finguardUser');
    }
  }, [user]);

  // Handle transaction recording & account balance update
  const handleAddTransaction = (newTxData: Omit<Transaction, 'transaction_id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      transaction_id: Date.now()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.account_id === newTx.account_id) {
        const delta = newTx.transaction_type === 'INCOME' ? Number(newTx.amount) : -Number(newTx.amount);
        return {
          ...acc,
          balance: Number(acc.balance) + delta
        };
      }
      return acc;
    }));

    // If expense, update budget allocation spent amount if category matches
    if (newTx.transaction_type === 'EXPENSE' && budget.allocations) {
      setBudget(prev => {
        const updatedAllocations = (prev.allocations || []).map(alloc => {
          if (alloc.category_id === newTx.category_id) {
            return {
              ...alloc,
              spent_amount: (Number(alloc.spent_amount) || 0) + Number(newTx.amount)
            };
          }
          return alloc;
        });
        return {
          ...prev,
          allocations: updatedAllocations
        };
      });
    }
  };

  const handleAlertLogged = (newAlert: SecurityAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(a => a.alert_id === alertId ? { ...a, status: 'RESOLVED' } : a));
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleUpdateBudget = (newBudget: Budget) => {
    setBudget(newBudget);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('finguardUser');
    setCurrentTab('landing');
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentTab('dashboard');
  };

  const activeAlertsCount = alerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenCodeStation={() => setIsCodeStationOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'landing' && (
          <LandingPageView
            onGetStarted={() => setCurrentTab('dashboard')}
            onOpenThreatLab={() => setCurrentTab('defense-lab')}
            onOpenAuth={handleOpenAuth}
            user={user}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            accounts={accounts}
            transactions={transactions}
            alerts={alerts}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenCodeStation={() => setIsCodeStationOpen(true)}
          />
        )}

        {currentTab === 'defense-lab' && (
          <ThreatLabView
            user={user}
            onAlertLogged={handleAlertLogged}
          />
        )}

        {currentTab === 'risk-check' && (
          <RiskCheckView
            user={user}
            onAlertLogged={handleAlertLogged}
          />
        )}

        {currentTab === 'scam-analyzer' && (
          <ScamAnalyzerView
            user={user}
            onAlertLogged={handleAlertLogged}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            user={user}
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetView
            user={user}
            categories={categories}
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            alerts={alerts}
          />
        )}

        {currentTab === 'security-alerts' && (
          <SecurityAlertsView
            user={user}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onClearAlerts={handleClearAlerts}
          />
        )}

        {currentTab === 'schema' && (
          <SchemaAnalyzerView />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            accounts={accounts}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FinGuard</span>
            <span>•</span>
            <span>Financial Risk, Scam Defense & Anomaly Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setCurrentTab('landing')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Overview & Mission
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('schema')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              ER Schema & DFD
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCodeStationOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Full Code Export
            </button>
          </div>
        </div>
      </footer>
{/* Unified Authentication & Password Reset Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
      />
    </div>
  );
}
