import React, { useState } from 'react';
import { Target, PieChart, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Budget, Category, User } from '../types';

interface BudgetViewProps {
  user: User | null;
  categories: Category[];
  budget: Budget;
  onUpdateBudget: (newBudget: Budget) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  user,
  categories,
  budget,
  onUpdateBudget
}) => {
  const [monthName, setMonthName] = useState<string>(budget.month_name || new Date().toISOString().slice(0, 7));
  const [totalLimit, setTotalLimit] = useState<string>(budget.total_limit?.toString() || '35000');
  const [allocations, setAllocations] = useState(budget.allocations || []);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a.allocated_amount) || 0), 0);
  const totalSpent = allocations.reduce((sum, a) => sum + (Number(a.spent_amount) || 0), 0);
  const remainingBudget = (Number(totalLimit) || 0) - totalSpent;
  const spentPercent = Number(totalLimit) > 0 ? Math.min(100, Math.round((totalSpent / Number(totalLimit)) * 100)) : 0;

  const handleAllocationChange = (index: number, val: string) => {
    const updated = [...allocations];
    updated[index].allocated_amount = parseFloat(val) || 0;
    setAllocations(updated);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBudget: Budget = {
      ...budget,
      month_name: monthName,
      total_limit: parseFloat(totalLimit) || 0,
      allocations
    };
    onUpdateBudget(updatedBudget);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>MODULE 05</span>
            <span>·</span>
            <span>SMART CATEGORY ALLOCATION & FISCAL THRESHOLDS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Smart Budget Planner
          </h1>
          <p className="text-slate-400 text-sm">
            Enforce spending limits against `budgets` and `budget_allocations` relational schema to prevent impulsive drain.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? 'Cancel Edit' : 'Adjust Monthly Limits'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Total Monthly Cap</div>
          <div className="text-2xl font-bold font-mono text-white">
            ₹{Number(totalLimit).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Period: {monthName}</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Disbursed So Far</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{spentPercent}% of monthly limit utilized</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">Remaining Safe Cap</div>
          <div className={`text-2xl font-bold font-mono ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {remainingBudget >= 0 ? 'Within approved threshold' : 'Exceeded ceiling!'}
          </div>
        </div>
      </div>

      {/* Main Budget Progress */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
            Overall Month Consumption
          </span>
          <span className="text-xs font-mono text-slate-400">
            {spentPercent}% Used
          </span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              spentPercent > 90 ? 'bg-rose-500' : spentPercent > 70 ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
      </div>

      {/* Category Allocations */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-6 flex items-center justify-between">
          <span>Category Allocations & Variance</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Total Allocated: ₹{totalAllocated.toLocaleString('en-IN')}
          </span>
        </h3>

        {isEditing ? (
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
                  Budget Month (YYYY-MM)
                </label>
                <input
                  type="month"
                  value={monthName}
                  onChange={(e) => setMonthName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
                  Total Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              {allocations.map((alloc, idx) => (
                <div key={alloc.allocation_id || idx} className="flex items-center justify-between gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs font-medium text-slate-200 w-1/3">
                    {alloc.category_name}
                  </span>
                  <div className="flex items-center gap-2 w-2/3">
                    <span className="text-xs font-mono text-slate-500">₹</span>
                    <input
                      type="number"
                      value={alloc.allocated_amount}
                      onChange={(e) => handleAllocationChange(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {allocations.map((alloc) => {
              const allocated = Number(alloc.allocated_amount) || 1;
              const spent = Number(alloc.spent_amount) || 0;
              const ratio = Math.min(100, Math.round((spent / allocated) * 100));
              const isOver = spent > allocated;

              return (
                <div key={alloc.allocation_id} className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alloc.category_name}</span>
                      {isOver && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          OVER LIMIT
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-slate-400">
                      <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-200 font-semibold'}>
                        ₹{spent.toLocaleString('en-IN')}
                      </span>{' '}
                      / ₹{allocated.toLocaleString('en-IN')} ({ratio}%)
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
