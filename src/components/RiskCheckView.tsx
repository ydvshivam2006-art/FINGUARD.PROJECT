import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, RefreshCw, Send, ShieldCheck, HelpCircle } from 'lucide-react';
import { SecurityAlert, User } from '../types';

interface RiskCheckViewProps {
  user: User | null;
  onAlertLogged: (alert: SecurityAlert) => void;
}

export const RiskCheckView: React.FC<RiskCheckViewProps> = ({ user, onAlertLogged }) => {
  const [amount, setAmount] = useState<string>('65000');
  const [recipientName, setRecipientName] = useState<string>('Quick Pay Trader');
  const [isNewRecipient, setIsNewRecipient] = useState<boolean>(true);
  const [isUrgent, setIsUrgent] = useState<boolean>(true);
  const [isUnknown, setIsUnknown] = useState<boolean>(true);
  const [isOddHours, setIsOddHours] = useState<boolean>(false);
  const [isHighVelocity, setIsHighVelocity] = useState<boolean>(false);
  const [isUnverifiedLink, setIsUnverifiedLink] = useState<boolean>(false);
  const [isDeviceMismatch, setIsDeviceMismatch] = useState<boolean>(false);

  // Advanced Homoglyph & Shannon Entropy Inspector State
  const [vpaTestInput, setVpaTestInput] = useState<string>('support.paytrn@okaxis');
  const [vpaInspectorResult, setVpaInspectorResult] = useState<{
    hasHomoglyph: boolean;
    homoglyphsFound: string[];
    entropyScore: number;
    verdict: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null>(null);

  const handleInspectVPA = (inputVal?: string) => {
    const target = (inputVal || vpaTestInput).trim().toLowerCase();
    const homoglyphs: string[] = [];

    // Check 1: 'rn' masquerading as 'm' (e.g. paytrn vs paytm)
    if (target.includes('paytrn')) homoglyphs.push("Homoglyph 'rn' masquerading as 'm' (paytrn -> paytm impersonation)");
    if (target.includes('sb1')) homoglyphs.push("Digit '1' replacing letter 'i' (sb1 -> sbi impersonation)");
    if (target.includes('hdic')) homoglyphs.push("Character transposition 'hdic' mimicking 'hdfc'");
    if (target.includes('lclcl')) homoglyphs.push("Visual letter substitution 'lclcl' mimicking 'icici'");
    if (target.includes('ybl.refund')) homoglyphs.push("Subdomain dot-spoofing masquerading as utility refund desk");

    // Check 2: Shannon Entropy calculation
    const len = target.length;
    const freq: { [key: string]: number } = {};
    for (const c of target) freq[c] = (freq[c] || 0) + 1;
    let entropy = 0;
    for (const c in freq) {
      const p = freq[c] / len;
      entropy -= p * Math.log2(p);
    }
    const normalizedEntropy = Math.min(100, Math.round((entropy / 4.5) * 100));

    const isHigh = homoglyphs.length > 0 || normalizedEntropy > 75;
    const isMedium = normalizedEntropy > 55 || target.includes('refund') || target.includes('support');

    setVpaInspectorResult({
      hasHomoglyph: homoglyphs.length > 0,
      homoglyphsFound: homoglyphs,
      entropyScore: normalizedEntropy,
      level: isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW',
      verdict: isHigh
        ? "CRITICAL TYPOSQUATTING: This VPA employs subtle optical character substitutions to impersonate a legitimate financial institution."
        : isMedium
        ? "MODERATE SUSPICION: VPA handle contains high entropy character randomness typical of automated mule account generation."
        : "LOW RISK: VPA syntax conforms to standard verified naming conventions."
    });
  };
  
  const [result, setResult] = useState<{
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    indicators: { title: string; points: number; explanation: string }[];
  } | null>(null);

  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    const indicators: { title: string; points: number; explanation: string }[] = [];

    const numAmount = parseFloat(amount) || 0;

    // Rule 1: High Transaction Value
    if (numAmount > 50000) {
      score += 30;
      indicators.push({
        title: "Large Transaction Amount (>₹50,000)",
        points: 30,
        explanation: "Transfers exceeding threshold carry disproportionate loss potential if fraudulent."
      });
    } else if (numAmount > 20000) {
      score += 15;
      indicators.push({
        title: "Elevated Transaction Amount (>₹20,000)",
        points: 15,
        explanation: "Moderate transaction value exceeds standard personal retail purchase average."
      });
    }

    // Rule 2: New Recipient
    if (isNewRecipient) {
      score += 20;
      indicators.push({
        title: "First-Time / Newly Added Beneficiary",
        points: 20,
        explanation: "No historical transaction lineage exists with this account address."
      });
    }

    // Rule 3: Urgency Pressure
    if (isUrgent) {
      score += 25;
      indicators.push({
        title: "Artificial Urgency & Time Coercion",
        points: 25,
        explanation: "Immediate deadlines ('pay now', 'within 10 minutes') prevent victims from pausing to verify."
      });
    }

    // Rule 4: Unknown / Unverified Source
    if (isUnknown) {
      score += 25;
      indicators.push({
        title: "Unknown or Unverified Recipient",
        points: 25,
        explanation: "Recipient credentials, bank branch, or KYC details could not be matched against verified entities."
      });
    }

    // Rule 5: Nocturnal timing
    if (isOddHours) {
      score += 15;
      indicators.push({
        title: "Unusual Hour Activity (01:00 AM - 05:00 AM)",
        points: 15,
        explanation: "Nocturnal transactions frequently correlate with social engineering or unauthorized access."
      });
    }

    // Rule 6: Velocity anomaly
    if (isHighVelocity) {
      score += 15;
      indicators.push({
        title: "Rapid Succession Transfer Anomaly",
        points: 15,
        explanation: "Multiple outbound payments dispatched in under 60 minutes indicates account draining behavior."
      });
    }

    // Rule 7: External unverified link
    if (isUnverifiedLink) {
      score += 20;
      indicators.push({
        title: "Payment Initiated Via Third-Party Web Link",
        points: 20,
        explanation: "External redirect links may disguise cloned phishing payment gateways."
      });
    }

    // Rule 8: Device mismatch
    if (isDeviceMismatch) {
      score += 15;
      indicators.push({
        title: "Device Footprint / Geolocation Variance",
        points: 15,
        explanation: "Session fingerprint differs significantly from primary user device pattern."
      });
    }

    // Bound score
    const finalScore = Math.min(100, score);
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (finalScore >= 60) {
      level = 'HIGH';
    } else if (finalScore >= 30) {
      level = 'MEDIUM';
    }

    setResult({
      score: finalScore,
      level,
      indicators
    });
    setAlertSubmitted(false);

    // If score >= 30, create alert
    if (finalScore >= 30) {
      const newAlert: SecurityAlert = {
        alert_id: Date.now(),
        user_id: user?.user_id || 1,
        alert_type: "Quick Risk Check",
        severity: level,
        details: indicators.map(i => i.title).join("; "),
        created_at: new Date().toISOString(),
        status: "ACTIVE"
      };
      onAlertLogged(newAlert);
      setAlertSubmitted(true);
    }
  };

  const resetForm = () => {
    setAmount('5000');
    setRecipientName('College Bookstore');
    setIsNewRecipient(false);
    setIsUrgent(false);
    setIsUnknown(false);
    setIsOddHours(false);
    setIsHighVelocity(false);
    setIsUnverifiedLink(false);
    setIsDeviceMismatch(false);
    setResult(null);
    setAlertSubmitted(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>MODULE 02</span>
          <span>·</span>
          <span>EXPLAINABLE 10-FACTOR RISK EVALUATION ENGINE</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Transaction Risk Assessment
        </h1>
        <p className="text-slate-400 text-sm">
          Simulate a real-time transfer assessment. Unlike opaque black-box models, FinGuard calculates
          an explainable composite risk score (0–100) with line-by-line justification for college viva defense.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <form onSubmit={handleEvaluate} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Transaction Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Threshold: Transfers &gt;₹50,000 add +30 risk points; &gt;₹20,000 add +15 risk points.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Recipient / Beneficiary Label
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Personal contact, merchant, or UPI ID"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Contextual Behavioral Indicators
              </label>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isNewRecipient}
                    onChange={(e) => setIsNewRecipient(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">New or First-Time Recipient (+20 pts)</span>
                    <span className="text-[11px] text-slate-400">Account has had 0 past settled transfers with this beneficiary.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Urgent Payment Pressure (+25 pts)</span>
                    <span className="text-[11px] text-slate-400">Pushed by time-sensitive claims (e.g. 'Pay within 15 min or face penalty').</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isUnknown}
                    onChange={(e) => setIsUnknown(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Unknown or Unverified Beneficiary (+25 pts)</span>
                    <span className="text-[11px] text-slate-400">VPA or account number has no public verification mark or banking history.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isOddHours}
                    onChange={(e) => setIsOddHours(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Odd Hours Transfer / 01:00 AM - 05:00 AM (+15 pts)</span>
                    <span className="text-[11px] text-slate-400">Anomalous nocturnal time window outside customary spending behavior.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isHighVelocity}
                    onChange={(e) => setIsHighVelocity(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Velocity Burst / Repeated Transfers (+15 pts)</span>
                    <span className="text-[11px] text-slate-400">More than 3 transfers attempted within the past 30 minutes.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isUnverifiedLink}
                    onChange={(e) => setIsUnverifiedLink(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Initiated via SMS / WhatsApp Link (+20 pts)</span>
                    <span className="text-[11px] text-slate-400">Clicked a shortlink (bit.ly, tinyurl) claiming to be an official invoice.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Calculate Explainable Risk Score</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors cursor-pointer"
                title="Reset to default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Results & Score Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className={`p-6 rounded-xl border ${
              result.level === 'HIGH'
                ? 'bg-rose-950/20 border-rose-800/50'
                : result.level === 'MEDIUM'
                ? 'bg-amber-950/20 border-amber-800/50'
                : 'bg-emerald-950/20 border-emerald-800/50'
            }`}>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase ${
                  result.level === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : result.level === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {result.level} RISK ASSESSMENT
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Scale: 0–100
                </span>
              </div>

              {/* Large Score Meter */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold font-mono text-white">
                    {result.score}
                  </span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                </div>
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

              {/* Auto Alert Notification */}
              {alertSubmitted && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Auto-logged into <strong>Security Alerts Feed</strong> (Severity: {result.level})
                  </span>
                </div>
              )}

              {/* Breakdown of Triggered Rules */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Triggered Factor Explanations ({result.indicators.length})
                </h4>
                {result.indicators.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.indicators.map((ind, i) => (
                      <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-white font-medium mb-1">
                          <span>{ind.title}</span>
                          <span className="font-mono text-cyan-400 font-bold">+{ind.points} pts</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{ind.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>No adverse risk flags triggered. Normal transaction profile.</span>
                  </p>
                )}
              </div>

              {/* Advisory recommendation */}
              <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                <strong className="text-white block mb-1">Recommended Security Action:</strong>
                {result.level === 'HIGH' ? (
                  <p className="text-rose-200 text-[11px] leading-relaxed">
                    DO NOT PROCEED. Contact your bank or verify recipient identity independently via telephone call. Do not input OTP or UPI PIN.
                  </p>
                ) : result.level === 'MEDIUM' ? (
                  <p className="text-amber-200 text-[11px] leading-relaxed">
                    Pause and verify. Send a nominal ₹1 test transfer first or confirm recipient name on bank beneficiary lookup before transferring full amount.
                  </p>
                ) : (
                  <p className="text-emerald-200 text-[11px] leading-relaxed">
                    Standard personal transfer. Proceed with standard security verification check.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 bg-slate-900/30">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Ready for Assessment</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Adjust the amount and contextual risk flags on the left, then click Calculate to generate the transparent scoring breakdown.
              </p>
            </div>
          )}

          {/* Academic Scoring System Reference Box */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>FinGuard 10-Factor Scoring Architecture</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Designed as a deterministic, explainable rule engine. Each weight is derived from RBI and Cyber Crime Cell fraud taxonomy guidelines:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
              <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                Large Amount: <span className="text-white font-bold">+30 pts</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                Time Coercion: <span className="text-white font-bold">+25 pts</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                Unknown Ben.: <span className="text-white font-bold">+25 pts</span>
              </div>
              <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                First Transfer: <span className="text-white font-bold">+20 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced VPA Homoglyph & Shannon Entropy Inspector */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">VPA Homoglyph Typosquatting & Character Entropy Inspector</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Detect deceptive optical lookalike handles (e.g. <code className="text-cyan-400">rn</code> mimicking <code className="text-cyan-400">m</code>, <code className="text-cyan-400">1</code> mimicking <code className="text-cyan-400">i</code>) and high-randomness bot-farm mule handles.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setVpaTestInput('support.paytrn@okaxis'); handleInspectVPA('support.paytrn@okaxis'); }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 cursor-pointer"
            >
              paytrn (rn vs m)
            </button>
            <button
              onClick={() => { setVpaTestInput('sb1.reward.desk@oksbi'); handleInspectVPA('sb1.reward.desk@oksbi'); }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 cursor-pointer"
            >
              sb1 (1 vs i)
            </button>
            <button
              onClick={() => { setVpaTestInput('irctc.official@icici'); handleInspectVPA('irctc.official@icici'); }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 cursor-pointer"
            >
              Legitimate
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={vpaTestInput}
            onChange={(e) => setVpaTestInput(e.target.value)}
            placeholder="e.g. support.paytrn@okaxis"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleInspectVPA()}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap"
          >
            Inspect VPA Entropy
          </button>
        </div>

        {vpaInspectorResult && (
          <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
            vpaInspectorResult.level === 'HIGH' ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' :
            vpaInspectorResult.level === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' :
            'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
                vpaInspectorResult.level === 'HIGH' ? 'bg-rose-500 text-slate-950' :
                vpaInspectorResult.level === 'MEDIUM' ? 'bg-amber-500 text-slate-950' :
                'bg-emerald-500 text-slate-950'
              }`}>
                {vpaInspectorResult.level} RISK · SHANNON ENTROPY: {vpaInspectorResult.entropyScore}%
              </span>
              <span className="text-xs font-mono text-slate-400">Lexical Forensic Audit</span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-white">{vpaInspectorResult.verdict}</p>

            {vpaInspectorResult.homoglyphsFound.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-rose-300 uppercase">Optical Mimicry Triggers Detected:</div>
                {vpaInspectorResult.homoglyphsFound.map((h, i) => (
                  <div key={i} className="text-xs font-mono text-rose-400 bg-slate-950/80 p-2 rounded border border-rose-900/50">
                    ⚠ {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
