import React from 'react';
import { ShieldCheck, Code2, AlertTriangle, User as UserIcon, LogOut, Home, KeyRound } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onOpenCodeStation: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'forgot') => void;
  onLogout: () => void;
  activeAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onOpenCodeStation,
  onOpenAuth,
  onLogout,
  activeAlertsCount
}) => {
  const navLinks = [
    { id: 'landing', label: 'Overview', icon: <Home className="w-3.5 h-3.5 inline mr-1" /> },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'defense-lab', label: 'Defense & UPI Lab' },
    { id: 'risk-check', label: 'Risk Check' },
    { id: 'scam-analyzer', label: 'Scam Analyzer' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budget', label: 'Smart Budget' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'security-alerts', label: 'Security Alerts', badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'schema', label: 'ER Schema & DFD' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                FinGuard
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`relative px-2.5 py-1.5 rounded-md transition-all text-xs xl:text-sm whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenCodeStation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all font-sans cursor-pointer whitespace-nowrap"
            title="View, copy full code, or download all project files as ZIP"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Project Code & ZIP</span>
            <span className="sm:hidden">Code</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => setCurrentTab('profile')}
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                title="Edit profile & security"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors text-xs cursor-pointer"
                title="Log Out of FinGuard"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden sm:inline-flex text-xs sm:text-sm font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav bar row for smaller screens */}
      <div className="lg:hidden border-t border-slate-800/80 px-4 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar bg-slate-950">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setCurrentTab(link.id)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded shrink-0 transition-colors ${
              currentTab === link.id
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {link.label}
            {link.badge !== undefined && ` (${link.badge})`}
          </button>
        ))}
      </div>
    </header>
  );
};
