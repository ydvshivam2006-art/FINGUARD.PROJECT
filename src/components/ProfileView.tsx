import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Save, CheckCircle2 } from 'lucide-react';
import { User, Account } from '../types';

interface ProfileViewProps {
  user: User | null;
  accounts: Account[];
  onUpdateUser: (updated: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, accounts, onUpdateUser }) => {
  const [name, setName] = useState<string>(user?.name || 'Shivam Yadav');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 98765 43210');
  const [email] = useState<string>(user?.email || 'student@test.com');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: User = {
      ...user,
      name,
      phone
    };
    onUpdateUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>MODULE 09</span>
          <span>·</span>
          <span>IDENTITY & CREDENTIAL REGISTRY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          User Profile & Accounts
        </h1>
        <p className="text-slate-400 text-sm">
          Mapped directly to SQL `users` and `accounts` relational tables with foreign key cascades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <span>Profile Details</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
                Registered Email (Primary Key ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Unique constraint in `users.email`.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
              {saved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Updated successfully!</span>
                </span>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Linked Accounts ({accounts.length})</span>
            </h3>

            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.account_id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{acc.account_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {acc.account_type}
                    </span>
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Account ID: #{acc.account_id} · Foreign Key: user_id={acc.user_id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
