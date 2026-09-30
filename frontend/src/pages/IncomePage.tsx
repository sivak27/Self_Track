import React, { useState, useEffect } from "react";
import { Plus, Landmark } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { IncomeSummaryCards } from "@/components/income/IncomeSummaryCards";
import { IncomeFilters } from "@/components/income/IncomeFilters";
import { IncomeList } from "@/components/income/IncomeList";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { useIncome } from "@/hooks/income/useIncome";
import { Income, CreateIncomeInput } from "@/types/income";

export function IncomePage() {
  const {
    incomes,
    sources,
    filters,
    setFilters,
    isLoading,
    totalReceived,
    totalDeposited,
    totalPending,
    totalRealized,
    addIncome,
    updateIncome,
    deleteIncome,
    addSource,
  } = useIncome();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState("salary");
  const [newSourceColor, setNewSourceColor] = useState("#10B981");

  useEffect(() => {
    document.title = "Income & Cash Inflow | Personal Control Center";
  }, []);

  const handleOpenAddModal = () => {
    setIncomeToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setIncomeToEdit(income);
    setIsModalOpen(true);
  };

  const handleSubmitIncome = async (data: CreateIncomeInput) => {
    if (incomeToEdit) {
      await updateIncome(incomeToEdit.id, data);
    } else {
      await addIncome(data);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    await addSource(newSourceName.trim(), newSourceType, newSourceColor);
    setNewSourceName("");
    setIsSourceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income & Cash Inflow"
        description="Track revenue channels, client retainers, salaries, and expected deposits."
      >
        <button
          onClick={() => setIsSourceModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
        >
          <Landmark className="w-3.5 h-3.5 text-emerald-600" />
          <span>New Stream</span>
        </button>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Income</span>
        </button>
      </PageHeader>

      <IncomeSummaryCards
        totalRealized={totalRealized}
        totalDeposited={totalDeposited}
        totalReceived={totalReceived}
        totalPending={totalPending}
      />

      <IncomeFilters
        filters={filters}
        onChange={setFilters}
      />

      <IncomeList
        incomes={incomes}
        isLoading={isLoading}
        onEdit={handleEditIncome}
        onDelete={deleteIncome}
        onAddNew={handleOpenAddModal}
      />

      <IncomeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitIncome}
        incomeToEdit={incomeToEdit}
        sources={sources}
      />

      {/* Add Income Source Modal */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Revenue Channel</h3>
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Acme Corp, Upwork Freelance"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Stream Type
                </label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                >
                  <option value="salary">Primary Salary</option>
                  <option value="freelance">Freelance / Contract</option>
                  <option value="investment">Investments / Dividends</option>
                  <option value="business">Business Revenue</option>
                  <option value="gift">Gift / Bonus</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Color Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newSourceColor}
                    onChange={(e) => setNewSourceColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 font-semibold">{newSourceColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
