import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { SecurityAlert, User } from '../types';

interface SecurityAlertsViewProps {
  user: User | null;
  alerts: SecurityAlert[];
  onResolveAlert: (alertId: number) => void;
  onClearAlerts: () => void;
}

export const SecurityAlertsView: React.FC<SecurityAlertsViewProps> = ({
  user,
  alerts,
  onResolveAlert,
  onClearAlerts
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const visibleAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>MODULE 07</span>
            <span>·</span>
            <span>INCIDENT LOGGING & THREAT AUDIT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Security Alerts Center
          </h1>
          <p className="text-slate-400 text-sm">
            Audit trail of flagged transactions and scam message detection events mapped to `security_alerts` table.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onClearAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs rounded-lg border border-slate-800 hover:border-rose-800/40 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setFilterSeverity('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            filterSeverity === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilterSeverity('HIGH')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            filterSeverity === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          High Risk
        </button>
        <button
          onClick={() => setFilterSeverity('MEDIUM')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            filterSeverity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Medium Risk
        </button>
        <button
          onClick={() => setFilterSeverity('LOW')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            filterSeverity === 'LOW' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-white'
          }`}
        >
          Low Risk
        </button>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => {
            const isHigh = alert.severity === 'HIGH';
            const isMedium = alert.severity === 'MEDIUM';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.alert_id}
                className={`p-4 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                    : isHigh
                    ? 'bg-rose-950/20 border-rose-800/40'
                    : isMedium
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isMedium
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {alert.severity} SEVERITY
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {alert.alert_type}
                    </span>
                    {isResolved && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        RESOLVED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {alert.details}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Incident ID: #ALT-{alert.alert_id.toString().slice(-4)}
                  </span>
                  {!isResolved && (
                    <button
                      onClick={() => onResolveAlert(alert.alert_id)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Acknowledge & Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 text-slate-500">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">No Active Incidents</h3>
            <p className="text-xs max-w-sm mx-auto">
              Any high-risk transactions or detected scam messages will be recorded here for compliance and forensic review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
