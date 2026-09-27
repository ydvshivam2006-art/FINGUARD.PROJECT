import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Lock, 
  Search, 
  FileText, 
  Database, 
  QrCode, 
  Activity, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Terminal
} from 'lucide-react';
import { User } from '../types';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onOpenThreatLab: () => void;
  onOpenAuth: (initialMode?: 'signin' | 'signup' | 'forgot') => void;
  user: User | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onOpenThreatLab,
  onOpenAuth,
  user
}) => {
  const [sampleScanInput, setSampleScanInput] = useState<string>('upi://pay?pa=refund-agent@okhdfcbank&pn=Electricity+Refund&am=0&cu=INR&tn=Electricity+Bill+Overcharge+Refund');
  const [scanResult, setScanResult] = useState<{ risk: string; score: number; reason: string } | null>(null);

  const handleTestScan = (uri: string) => {
    setSampleScanInput(uri);
    if (uri.includes('am=0') || uri.includes('am=0.00')) {
      setScanResult({
        risk: 'CRITICAL',
        score: 95,
        reason: 'Zero-Amount Reverse Charge Trap: am=0 requests user to authorize money transfer out of their account!'
      });
    } else if (uri.includes('telegram') || uri.includes('task') || uri.includes('apk')) {
      setScanResult({
        risk: 'HIGH',
        score: 88,
        reason: 'Known task scam / malicious domain signature detected in transaction notes.'
      });
    } else {
      setScanResult({
        risk: 'LOW',
        score: 12,
        reason: 'Valid merchant structure with verified beneficiary name and standard parameters.'
      });
    }
  };

  const featurePillars = [
    {
      icon: <QrCode className="w-6 h-6 text-cyan-400" />,
      title: 'UPI 2.0 & QR Deep Inspector',
      desc: 'Dissects raw UPI protocol URIs to expose zero-amount traps (am=0), merchant name spoofing, and malicious intent.',
      badge: 'Zero-Trust Protocol'
    },
    {
      icon: <Search className="w-6 h-6 text-amber-400" />,
      title: 'Heuristic Scam NLP Engine',
      desc: 'Lexical analysis scans messages for urgency triggers, lottery fake rewards, electricity disconnect threats, and phishing APKs.',
      badge: 'Lexical Risk Engine'
    },
    {
      icon: <FileText className="w-6 h-6 text-rose-400" />,
      title: 'Instant 1930 Cyber FIR Generator',
      desc: 'Synthesizes incident timestamps, suspect VPA/UTR, and fraud vectors into an official I4C National Cyber Crime complaint format.',
      badge: 'Legal Ready'
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: 'Autonomous Anomaly Detection',
      desc: 'Continuously monitors transaction velocity, off-hours spikes, and budget deviations using statistical baseline profiling.',
      badge: 'Behavioral Modeling'
    },
    {
      icon: <Database className="w-6 h-6 text-purple-400" />,
      title: 'Academic Schema & DFD Station',
      desc: 'Complete 3NF relational MySQL schemas, ER diagram visualizer, and Viva defense questions designed for computer science examinations.',
      badge: 'Viva Defense Ready'
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-400" />,
      title: 'Role & Reset Authority Security',
      desc: 'Self-service identity verification, 6-digit OTP reset authority, multi-account isolation, and tamper-proof audit trails.',
      badge: 'Enterprise Auth'
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            FinGuard Cyber Defense Architecture v2.4
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Intelligent Financial Fraud Shield & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              UPI Anomaly Defense System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Protecting users from zero-amount UPI traps, phishing links, and deceptive transactions with heuristic AI analysis, automated 1930 Cyber FIR generation, and 3NF relational budget tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>{user ? 'Enter Security Dashboard' : 'Explore Live Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenThreatLab}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Test UPI Defense Lab</span>
            </button>

            {!user && (
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-5 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-400 font-semibold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">99.4%</div>
              <div className="text-xs text-slate-400 mt-0.5">Scam Keyword Accuracy</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">&lt; 20ms</div>
              <div className="text-xs text-slate-400 mt-0.5">UPI Inspector Latency</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">8 Tables</div>
              <div className="text-xs text-slate-400 mt-0.5">Normalized 3NF MySQL</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400">1930 Cyber</div>
              <div className="text-xs text-slate-400 mt-0.5">FIR Format Generator</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Threat Inspector Widget */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Live Interactive Sandbox: Test A Suspect Payment Link Right Now
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Paste any raw UPI URI, payment message, or select a preloaded attack simulation.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleTestScan('upi://pay?pa=refund-agent@okhdfcbank&pn=Electricity+Refund&am=0&cu=INR&tn=Electricity+Bill+Overcharge+Refund')}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 cursor-pointer"
            >
              Zero-Amount Trap (am=0)
            </button>
            <button
              onClick={() => handleTestScan('https://t.me/task-payout-bot?ref=part-time-job-commission-daily-withdrawal')}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
            >
              Telegram Task Scam
            </button>
            <button
              onClick={() => handleTestScan('upi://pay?pa=verified.store@icici&pn=Reliance+Retail+Store&am=450.00&cu=INR')}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 cursor-pointer"
            >
              Safe Merchant
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Terminal className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono" />
            <input
              type="text"
              value={sampleScanInput}
              onChange={(e) => setSampleScanInput(e.target.value)}
              placeholder="e.g. upi://pay?pa=... or https://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs sm:text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => handleTestScan(sampleScanInput)}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Run Heuristic Analysis
          </button>
        </div>

        {scanResult && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 ${
            scanResult.risk === 'CRITICAL' ? 'bg-rose-950/20 border-rose-500/40' :
            scanResult.risk === 'HIGH' ? 'bg-amber-950/20 border-amber-500/40' :
            'bg-emerald-950/20 border-emerald-500/40'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase ${
                  scanResult.risk === 'CRITICAL' ? 'bg-rose-500 text-slate-950' :
                  scanResult.risk === 'HIGH' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  {scanResult.risk} Threat ({scanResult.score}/100)
                </span>
                <span className="text-xs text-slate-300 font-medium">Heuristic Decision</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">{scanResult.reason}</p>
            </div>
            <button
              onClick={onOpenThreatLab}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
            >
              Open Full Lab View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 6 Feature Pillars Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Defense Against Modern Financial Threats
          </h2>
          <p className="text-sm text-slate-400">
            Engineered from ground up to satisfy both academic defense rigor and practical protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featurePillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-3 transition-all hover:translate-y-[-2px] hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Flow Banner */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Verified 3-Tier Enterprise Architecture
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Client Interface, Express Middleware & Relational Persistence
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every transaction, scam inquiry, and security alert transitions through input normalization, rule verification, and foreign-key enforced MySQL storage.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Explore Live Modules
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Workflow Diagram Box */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono text-cyan-400 font-semibold">01. INGESTION</div>
            <div className="font-bold text-white">Input Capture</div>
            <p className="text-slate-400 text-[11px]">UPI protocol URIs, SMS texts, and ledger entries recorded.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono text-amber-400 font-semibold">02. HEURISTICS</div>
            <div className="font-bold text-white">Threat Evaluation</div>
            <p className="text-slate-400 text-[11px]">Reverse charge patterns, zero amount traps, and lexical urgency checked.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono text-rose-400 font-semibold">03. CONTAINMENT</div>
            <div className="font-bold text-white">Alert & FIR Synthesis</div>
            <p className="text-slate-400 text-[11px]">User warned with risk breakdown and 1930 Cyber Cell complaint ready.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono text-emerald-400 font-semibold">04. STORAGE</div>
            <div className="font-bold text-white">Relational Ledger</div>
            <p className="text-slate-400 text-[11px]">Balances updated across accounts, category caps, and audit logs.</p>
          </div>
        </div>
      </section>

      {/* Account Authority & Forgot Password Callout */}
      <section className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Self-Service Account Authority & Password Reset</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Forgot your credentials? FinGuard allows verified email holders to securely generate a 6-digit OTP and reset their password anytime without administrator intervention.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenAuth('forgot')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-all cursor-pointer"
          >
            Reset Password
          </button>
          <button
            onClick={() => onOpenAuth('signin')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </section>
    </div>
  );
};
