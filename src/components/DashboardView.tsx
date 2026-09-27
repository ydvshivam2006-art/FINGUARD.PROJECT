import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  FileCode, 
  Search, 
  Database,
  ArrowRight,
  Radio,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Activity,
  Info
} from 'lucide-react';
import { User, Account, Transaction, SecurityAlert } from '../types';

interface DashboardViewProps {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  alerts: SecurityAlert[];
  onNavigate: (tab: string) => void;
  onOpenCodeStation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  accounts,
  transactions,
  alerts,
  onNavigate,
  onOpenCodeStation
}) => {
  const [isPanicMode, setIsPanicMode] = useState<boolean>(false);
  const [panicPin, setPanicPin] = useState<string>('');
  const [panicMessage, setPanicMessage] = useState<string>('');

  // Interactive Live Anomaly Radar Simulator State
  const [radarAmount, setRadarAmount] = useState<number>(48500);
  const [radarHour, setRadarHour] = useState<number>(3); // 3 AM
  const [radarNewDevice, setRadarNewDevice] = useState<boolean>(true);
  const [radarEntropy, setRadarEntropy] = useState<number>(78); // 78% VPA randomness

  // Calculate dynamic Anomaly Vector
  const isOffHours = radarHour >= 1 && radarHour <= 5;
  const isHighValue = radarAmount >= 25000;
  
  let computedRiskScore = 15;
  if (isHighValue) computedRiskScore += Math.min(35, Math.round((radarAmount / 100000) * 35));
  if (isOffHours) computedRiskScore += 25;
  if (radarNewDevice) computedRiskScore += 20;
  if (radarEntropy > 60) computedRiskScore += Math.round((radarEntropy - 60) * 0.5);
  computedRiskScore = Math.min(99, Math.max(10, computedRiskScore));

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);
  
  const totalIncome = transactions
    .filter(t => t.transaction_type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.transaction_type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const highRiskCount = alerts.filter(a => a.severity === 'HIGH' && a.status !== 'RESOLVED').length;

  // Dynamic Safety Score (0-100)
  let safetyScore = 95;
  if (isPanicMode) safetyScore = 10;
  else {
    if (highRiskCount > 0) safetyScore -= highRiskCount * 22;
    if (activeAlerts.length > highRiskCount) safetyScore -= (activeAlerts.length - highRiskCount) * 8;
    if (totalExpense > totalBalance && totalBalance > 0) safetyScore -= 15;
    safetyScore = Math.max(18, Math.min(100, safetyScore));
  }

  const safetyStatus = 
    isPanicMode ? { label: 'EMERGENCY LOCKDOWN ACTIVE', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/50' } :
    safetyScore >= 85 ? { label: 'FORTIFIED DEFENSE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' } :
    safetyScore >= 60 ? { label: 'MODERATE SHIELD', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' } :
    { label: 'ELEVATED THREAT EXPOSURE', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };

  const handleTogglePanic = () => {
    if (!isPanicMode) {
      setIsPanicMode(true);
      setPanicMessage('🚨 PANIC KILL-SWITCH ENGAGED: Outgoing UPI permissions frozen. Active mandates revoked. Simulated I4C nodal freeze broadcast emitted.');
    } else {
      if (panicPin === '1234' || panicPin === '') {
        setIsPanicMode(false);
        setPanicPin('');
        setPanicMessage('✅ Lockdown lifted. VPA channels restored to baseline safety monitoring.');
      } else {
        setPanicMessage('❌ Invalid authorization PIN. Enter 1234 or leave blank to disarm.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Cyber Threat Intelligence Ticker */}
      <div className="bg-slate-900/90 border border-cyan-800/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono text-cyan-400 font-semibold uppercase tracking-wider">LIVE ADVISORY:</span>
          <span className="text-slate-300">
            Never scan a QR code or enter your UPI PIN to "receive" money. UPI PIN is strictly for debiting funds.
          </span>
        </div>
        <button
          onClick={() => onNavigate('defense-lab')}
          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Open Defense & UPI Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <span>FINANCIAL INTELLIGENCE & SECURITY SYSTEM</span>
            <span>·</span>
            <span>ACADEMIC CAPSTONE / COMPETITION PROJECT</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Welcome back, {user ? user.name : 'Shivam'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
            FinGuard is an explainable fraud detection, scam situation analyzer, and personal finance guardian.
            All algorithmic rule weights, transaction logs, and security alert triggers are connected.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('defense-lab')}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-all shadow-sm cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>UPI & QR Defense Lab</span>
            </button>
            <button
              onClick={() => onNavigate('risk-check')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-lg text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <span>10-Factor Risk Check</span>
            </button>
            <button
              onClick={() => onNavigate('scam-analyzer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-lg text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Scam Analyzer</span>
            </button>
            <button
              onClick={onOpenCodeStation}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-medium rounded-lg text-sm border border-cyan-800/40 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Project Code & ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Safety Index Gauge */}
        <div className="bg-slate-900/80 border border-cyan-800/40 rounded-xl p-5 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>SAFETY HEALTH INDEX</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-2xl font-bold font-mono tracking-tight ${safetyStatus.color}`}>
              {safetyScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            {safetyStatus.label}
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>TOTAL LIQUID BALANCE</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>Across {accounts.length} linked accounts</span>
          </div>
        </div>

        {/* Total Inflow */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>RECORDED INFLOW</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 mb-1">
            +₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            Monthly stipend & revenue streams
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>RECORDED OUTFLOW</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-400 mb-1">
            -₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            Categorized household & academic expenses
          </div>
        </div>

        {/* Security Health */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>RISK & ALERT STATUS</span>
            {highRiskCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
            {activeAlerts.length} <span className="text-sm font-normal text-slate-400">Warnings</span>
          </div>
          <div className="text-xs text-slate-500">
            {highRiskCount > 0 ? (
              <span className="text-rose-400 font-medium">{highRiskCount} High-risk incident pending</span>
            ) : (
              <span className="text-emerald-400">Security shield active</span>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Account Panic Kill-Switch Banner */}
      <div className={`rounded-xl border p-4 sm:p-5 transition-all ${
        isPanicMode 
          ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/50' 
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPanicMode ? 'bg-rose-500 text-slate-950 animate-pulse' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}>
              {isPanicMode ? <Lock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isPanicMode ? 'EMERGENCY LOCKDOWN ACTIVE' : 'Emergency Kill-Switch (Panic Mode)'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isPanicMode ? 'bg-rose-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isPanicMode ? 'VPAs QUARANTINED' : 'STANDBY ARMED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPanicMode 
                  ? 'Outgoing UPI authorizations, standing mandates, and debit channels are frozen.'
                  : 'Instantly lock all virtual payment addresses (VPAs) and auto-revoke standing mandates in case of active device loss or phishing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isPanicMode && (
              <input
                type="password"
                maxLength={4}
                value={panicPin}
                onChange={(e) => setPanicPin(e.target.value)}
                placeholder="PIN (1234)"
                className="w-24 bg-slate-950 border border-rose-500/50 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono text-white focus:outline-none"
              />
            )}
            <button
              onClick={handleTogglePanic}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isPanicMode 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30'
              }`}
            >
              {isPanicMode ? <Unlock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{isPanicMode ? 'Authorize Disarm' : 'Activate Panic Lockdown'}</span>
            </button>
          </div>
        </div>

        {panicMessage && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
            isPanicMode ? 'bg-rose-900/30 border border-rose-700/50 text-rose-300' : 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-300'
          }`}>
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{panicMessage}</span>
          </div>
        )}
      </div>

      {/* Advanced Interactive Cyber Anomaly Radar & Live Vector Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-base font-bold text-white">Live Threat Radar & Heuristic Anomaly Vector Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate dynamic transfer parameters to evaluate the composite anomaly vector in real time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              Algorithm: CAV v2.4 (Shannon Entropy + Temporal Decay)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Visual Rotating Radar */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Concentric Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/25" />
              <div className="absolute inset-8 rounded-full border border-cyan-500/30" />
              <div className="absolute inset-14 rounded-full border border-cyan-500/40" />

              {/* Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/20" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/20" />

              {/* Rotating Sweep Beam */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 70%, rgba(6, 182, 212, 0.4) 100%)',
                  animation: 'spin 3.5s linear infinite'
                }}
              />

              {/* Blip 1: Normal Transaction */}
              <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-ping" />
              <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-emerald-400" />

              {/* Blip 2: Simulated Anomaly */}
              <div className={`absolute bottom-8 right-10 w-2.5 h-2.5 rounded-full ${
                computedRiskScore > 65 ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
              }`} />
              <div className={`absolute bottom-8 right-10 w-2.5 h-2.5 rounded-full ${
                computedRiskScore > 65 ? 'bg-rose-500' : 'bg-amber-400'
              }`} />

              {/* Center Core */}
              <div className="relative z-10 text-center">
                <div className={`text-3xl font-black font-mono tracking-tight ${
                  computedRiskScore >= 70 ? 'text-rose-400' : computedRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {computedRiskScore}
                </div>
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">RISK INDEX</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between w-full text-[11px] font-mono border-t border-slate-900 pt-2 text-slate-400">
              <span>SCAN FREQ: 100ms</span>
              <span className={computedRiskScore >= 70 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {computedRiskScore >= 70 ? '● THREAT INTERCEPTED' : '● SYSTEM SECURE'}
              </span>
            </div>
          </div>

          {/* Interactive Vector Sliders */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slider 1: Amount */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Transaction Outflow</span>
                  <span className="font-mono text-cyan-400 font-bold">₹{radarAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="150000"
                  step="500"
                  value={radarAmount}
                  onChange={(e) => setRadarAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₹500 (Retail)</span>
                  <span>₹1.5L (High-Risk)</span>
                </div>
              </div>

              {/* Slider 2: Hour of Day */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Temporal Window (Hour)</span>
                  <span className={`font-mono font-bold ${isOffHours ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {radarHour.toString().padStart(2, '0')}:00 {isOffHours ? '(Off-Hours ⚠️)' : '(Active Business)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={radarHour}
                  onChange={(e) => setRadarHour(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>00:00 (Midnight)</span>
                  <span>12:00 (Noon)</span>
                  <span>23:00 (Night)</span>
                </div>
              </div>

              {/* Slider 3: VPA Lexical Entropy */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">VPA Character Entropy (Randomness)</span>
                  <span className="font-mono text-cyan-400 font-bold">{radarEntropy}% (Shannon)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={radarEntropy}
                  onChange={(e) => setRadarEntropy(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (Verified Brand)</span>
                  <span>100% (Mule Bot Farm)</span>
                </div>
              </div>

              {/* Toggle 4: Device Anomaly */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">New Device / IP Geofence Shift</div>
                  <div className="text-[11px] text-slate-400">Untrusted browser signature detected</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRadarNewDevice(!radarNewDevice)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    radarNewDevice ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${
                    radarNewDevice ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Verdict Box */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
              computedRiskScore >= 70 ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' :
              computedRiskScore >= 40 ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' :
              'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider text-[11px] font-mono">
                  {computedRiskScore >= 70 ? 'RECOMMENDED ACTION: HARD BLOCK & NOTIFY USER' :
                   computedRiskScore >= 40 ? 'RECOMMENDED ACTION: STEP-UP BIOMETRIC 2FA CHALLENGE' :
                   'RECOMMENDED ACTION: FAST-PATH APPROVAL'}
                </span>
                <p className="text-[11px] text-slate-300">
                  {computedRiskScore >= 70 
                    ? 'Excessive composite vector: combination of off-hours timing, high value, and elevated VPA lexical randomness indicates automated credential stuffing or mule drain.'
                    : computedRiskScore >= 40
                    ? 'Moderate deviation: transaction falls outside normal baseline. Require step-up approval before dispatching funds.'
                    : 'Transaction signature matches historical user behavior profile.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('defense-lab')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-300 shrink-0 font-semibold text-xs cursor-pointer"
              >
                Inspect in Lab →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800/90 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Real-time ledger updates with category tagging</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {transactions.slice(0, 5).map((t) => {
                  const isIncome = t.transaction_type === 'INCOME';
                  return (
                    <tr key={t.transaction_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {t.transaction_date}
                      </td>
                      <td className="py-3 px-3 font-medium text-white max-w-[200px] truncate">
                        {t.notes || 'Unspecified transaction'}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        <span className="text-slate-300">
                          {t.category_name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {t.account_name}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-semibold whitespace-nowrap ${
                        isIncome ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {isIncome ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Security Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Active Alerts Box */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Security Alerts</h2>
                <p className="text-xs text-slate-400">Explainable incident logs</p>
              </div>
              <button
                onClick={() => onNavigate('security-alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map((a) => {
                const isHigh = a.severity === 'HIGH';
                const isMedium = a.severity === 'MEDIUM';
                return (
                  <div
                    key={a.alert_id}
                    className={`p-3 rounded-lg border text-xs ${
                      isHigh
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                        : isMedium
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{a.alert_type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isHigh ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-snug line-clamp-2">{a.details}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>College Project Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Explore the complete 8-table relational MySQL schema, entity relationship connections, and DFD logic for viva presentation.
            </p>
            <button
              onClick={() => onNavigate('schema')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Inspect ER Diagram & DFD</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
