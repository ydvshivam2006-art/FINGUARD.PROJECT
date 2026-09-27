import React, { useState } from 'react';
import { Search, AlertOctagon, CheckCircle2, Copy, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { SAMPLE_SCAMS } from '../data/mockData';
import { SecurityAlert, User } from '../types';

interface ScamAnalyzerViewProps {
  user: User | null;
  onAlertLogged: (alert: SecurityAlert) => void;
}

export const ScamAnalyzerView: React.FC<ScamAnalyzerViewProps> = ({ user, onAlertLogged }) => {
  const [message, setMessage] = useState<string>(SAMPLE_SCAMS[0].text);
  const [result, setResult] = useState<{
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    indicators: { message: string; points: number; matches: string[] }[];
  } | null>(null);

  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);

  const analyzeScam = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const originalText = message.trim();
    if (!originalText) return;

    const text = originalText.toLowerCase();
    let score = 0;
    const indicators: { message: string; points: number; matches: string[] }[] = [];

    const rules = [
      {
        regex: /(otp|upi\s*pin|\bpin\b|\bcvv\b|password|netbanking|card\s*expiry)/gi,
        points: 25,
        message: "Requests sensitive financial credentials (OTP, UPI PIN, CVV, Password)"
      },
      {
        regex: /(urgent|immediately|now|within\s*24\s*hours|disconnected|blocked|suspended|terminate|tonight)/gi,
        points: 20,
        message: "Injects false urgency or threats of immediate service disconnection/block"
      },
      {
        regex: /(prize|lottery|reward|winner|selected\s*for|won|crorepati|lucky\s*draw)/gi,
        points: 20,
        message: "Claims unexpected lottery, cash reward or contest win (Advance-Fee Fraud)"
      },
      {
        regex: /(https?:\/\/[^\s]+|bit\.ly[^\s]+|tinyurl[^\s]+|\.xyz|\.top|click\s*here|verify\s*account|update\s*kyc)/gi,
        points: 20,
        message: "Directs to unverified external link or deceptive credential harvesting site"
      },
      {
        regex: /(refund|cashback|credited|overpaid|claim\s*refund)/gi,
        points: 15,
        message: "Contains unsolicited refund, tax rebate or cashback disbursement pretext"
      },
      {
        regex: /(cbi|police|customs|narcotics|arrest\s*warrant|digital\s*arrest|court\s*notice|crime\s*branch)/gi,
        points: 25,
        message: "Impersonates law enforcement or judicial authorities for digital coercion"
      },
      {
        regex: /(anydesk|teamviewer|rustdesk|quicksupport|\.apk|install\s*app|download\s*file)/gi,
        points: 25,
        message: "Demands installation of remote desktop access or unverified third-party APK"
      },
      {
        regex: /(work\s*from\s*home|like\s*youtube|telegram|earn\s*daily|part[\s-]time\s*job)/gi,
        points: 15,
        message: "Promotes high-yield task scam or clandestine Telegram recruiting"
      }
    ];

    rules.forEach((rule) => {
      const matches = originalText.match(rule.regex);
      if (matches && matches.length > 0) {
        score += rule.points;
        indicators.push({
          message: rule.message,
          points: rule.points,
          matches: Array.from(new Set(matches.map(m => m.toLowerCase())))
        });
      }
    });

    score = Math.min(score, 100);
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 60) {
      level = 'HIGH';
    } else if (score >= 30) {
      level = 'MEDIUM';
    }

    setResult({
      score,
      level,
      indicators
    });
    setAlertSubmitted(false);

    if (score >= 30) {
      const newAlert: SecurityAlert = {
        alert_id: Date.now(),
        user_id: user?.user_id || 1,
        alert_type: "Scam Analyzer",
        severity: level,
        details: indicators.map(i => i.message).join("; "),
        created_at: new Date().toISOString(),
        status: "ACTIVE"
      };
      onAlertLogged(newAlert);
      setAlertSubmitted(true);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>MODULE 03</span>
          <span>·</span>
          <span>SCAM SITUATION & SOCIAL ENGINEERING ANALYZER</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Scam Situation Analyzer
        </h1>
        <p className="text-slate-400 text-sm">
          Paste any SMS, WhatsApp alert, email, or digital payment notice to inspect whether it matches
          known phishing, electricity bill cut-off, KYC freeze, or digital arrest patterns.
        </p>
      </div>

      {/* Preset Example Pills */}
      <div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          Test With Real-World 2026 Fraud Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SCAMS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMessage(s.text);
                setResult(null);
                setAlertSubmitted(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Textarea (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <form onSubmit={analyzeScam} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Suspicious Message Content
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {message.length} characters
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                placeholder="Paste suspicious SMS, Telegram text, WhatsApp forward, or email body here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-sm text-slate-100 font-sans focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Analyze Message For Fraud Signatures</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  setResult(null);
                  setAlertSubmitted(false);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Results Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className={`p-6 rounded-xl border ${
              result.level === 'HIGH'
                ? 'bg-rose-950/20 border-rose-800/50'
                : result.level === 'MEDIUM'
                ? 'bg-amber-950/20 border-amber-800/50'
                : 'bg-emerald-950/20 border-emerald-800/50'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase ${
                  result.level === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : result.level === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {result.level} SCAM RISK
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Confidence Score: {result.score}/100
                </span>
              </div>

              {/* Score bar */}
              <div className="mb-5">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.level === 'HIGH'
                        ? 'bg-rose-500'
                        : result.level === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Alert Notification */}
              {alertSubmitted && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 mb-4 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Auto-recorded incident into <strong>Security Alerts Feed</strong>
                  </span>
                </div>
              )}

              {/* Detected Indicators */}
              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Detected Pattern Indicators ({result.indicators.length})
                </h4>
                {result.indicators.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.indicators.map((ind, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-white font-medium mb-1">
                          <span>{ind.message}</span>
                          <span className="font-mono text-cyan-400 font-bold">+{ind.points} pts</span>
                        </div>
                        {ind.matches.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ind.matches.map((m, mi) => (
                              <span key={mi} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 border border-rose-800/40 text-rose-300">
                                "{m}"
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No known fraud, phishing, or credential harvesting phrases detected.</span>
                  </div>
                )}
              </div>

              {/* Action advice */}
              <div className="border-t border-slate-800 pt-4 text-xs">
                <strong className="text-white block mb-1">Crucial Safety Protocol:</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Never share your OTP, UPI PIN, CVV, password, or banking passwords over call or SMS. No legitimate bank, electricity department, or police officer will ever ask you to enter a UPI PIN to receive money.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 bg-slate-900/30">
              <Shield className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Awaiting Text Input</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Click any of the sample scenarios above or paste your own message to evaluate against the scam taxonomy database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
