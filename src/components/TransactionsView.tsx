import React, { useState } from 'react';
import { PlusCircle, Search, Filter, ArrowDownLeft, ArrowUpRight, Wallet, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Transaction, Account, Category, User } from '../types';

interface TransactionsViewProps {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'transaction_id'>) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  user,
  accounts,
  categories,
  transactions,
  onAddTransaction,
}) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<number>(accounts[0]?.account_id || 1);
  const [categoryId, setCategoryId] = useState<number>(categories[2]?.category_id || 3);
  const [notes, setNotes] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'ANOMALIES'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const filteredCategories = categories.filter(c => c.category_type === type);

  // Dynamic Anomaly Detection Baseline
  const expenseList = transactions.filter(t => t.transaction_type === 'EXPENSE');
  const avgExpense = expenseList.length > 0 
    ? expenseList.reduce((sum, t) => sum + Number(t.amount), 0) / expenseList.length 
    : 1500;

  const isAnomaly = (t: Transaction) => {
    if (t.transaction_type !== 'EXPENSE') return false;
    const isSpike = Number(t.amount) > avgExpense * 2.2;
    const lowerNotes = (t.notes || '').toLowerCase();
    const hasTrigger = ['crypto', 'urgent', 'unknown', 'telegram', 'p2p', 'lottery'].some(w => lowerNotes.includes(w));
    return isSpike || hasTrigger;
  };

  const anomalyCount = transactions.filter(isAnomaly).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const selectedCategory = categories.find(c => c.category_id === Number(categoryId));
    const selectedAccount = accounts.find(a => a.account_id === Number(accountId));

    onAddTransaction({
      user_id: user?.user_id || 1,
      account_id: Number(accountId),
      category_id: Number(categoryId),
      transaction_type: type,
      amount: numAmount,
      transaction_date: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || `${type === 'INCOME' ? 'Received' : 'Paid'} for ${selectedCategory?.category_name}`,
      category_name: selectedCategory?.category_name,
      account_name: selectedAccount?.account_name
    });

    setAmount('');
    setNotes('');
    setShowAddForm(false);
  };

  const visibleTransactions = transactions.filter((t) => {
    if (filterType === 'INCOME' && t.transaction_type !== 'INCOME') return false;
    if (filterType === 'EXPENSE' && t.transaction_type !== 'EXPENSE') return false;
    if (filterType === 'ANOMALIES' && !isAnomaly(t)) return false;

    if (searchTerm) {
      const matchNotes = (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchNotes || matchCategory;
    }
    return true;
  });

  const totalInflow = transactions
    .filter(t => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = transactions
    .filter(t => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // CSV Audit Ledger Export
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount (INR)', 'Category', 'Account', 'Notes', 'Anomaly Flag'];
    const rows = transactions.map(t => [
      t.transaction_id,
      t.transaction_date,
      t.transaction_type,
      t.amount,
      `"${t.category_name || 'General'}"`,
      `"${t.account_name || 'Main Account'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      isAnomaly(t) ? 'YES_ANOMALY' : 'NORMAL'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinGuard_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>MODULE 04</span>
            <span>·</span>
            <span>ANOMALY PROFILING & RELATIONAL LEDGER</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Transactions & Anomaly Engine
          </h1>
          <p className="text-slate-400 text-sm">
            Categorized financial records mapped to MySQL tables with automatic statistical outlier and velocity spike detection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Download full transaction audit ledger as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Close Entry Form' : 'Record Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Statistical Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 block text-[11px]">TOTAL INFLOW</span>
          <span className="text-emerald-400 font-bold text-sm">+₹{totalInflow.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 block text-[11px]">TOTAL OUTFLOW</span>
          <span className="text-rose-400 font-bold text-sm">-₹{totalOutflow.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 block text-[11px]">EXPENSE BASELINE (AVG)</span>
          <span className="text-slate-200 font-bold text-sm">₹{avgExpense.toFixed(0)}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 block text-[11px]">SPIKE ANOMALIES</span>
          <span className={`font-bold text-sm ${anomalyCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {anomalyCount} Flagged
          </span>
        </div>
      </div>

      {/* Add Transaction Accordion / Modal */}
      {showAddForm && (
        <div className="bg-slate-900 border border-cyan-800/50 rounded-xl p-6 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Record New Financial Event</span>
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Type
              </label>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                    type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                    type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {accounts.map(a => (
                  <option key={a.account_id} value={a.account_id}>
                    {a.account_name} (₹{Number(a.balance).toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {filteredCategories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Note / Description
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Monthly Wi-Fi broadband renewal"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterType === 'INCOME' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inflow
          </button>
          <button
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterType === 'EXPENSE' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Outflow
          </button>
          <button
            onClick={() => setFilterType('ANOMALIES')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterType === 'ANOMALIES' ? 'bg-amber-950 text-amber-300 border border-amber-800/40 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Anomalies ({anomalyCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes or category..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
          <div>In: <span className="text-emerald-400 font-bold">+₹{totalInflow.toLocaleString('en-IN')}</span></div>
          <div>Out: <span className="text-rose-400 font-bold">-₹{totalOutflow.toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Source Account</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {visibleTransactions.length > 0 ? (
                visibleTransactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <tr key={tx.transaction_id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {tx.transaction_date}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-[320px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{tx.notes}</span>
                          {isAnomaly(tx) && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Anomaly</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {tx.category_name || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {tx.account_name}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold text-sm whitespace-nowrap tabular-nums ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No transactions match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
