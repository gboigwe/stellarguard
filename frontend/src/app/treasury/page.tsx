"use client";

import { useState } from "react";

function DepositModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    // TODO [FE-7]: wire up Soroban deposit transaction
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Deposit Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (XLM)</label>
            <input
              type="number"
              min="0.0000001"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-blue"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Submitting…" : "Confirm Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TreasuryPage() {
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="space-y-8">
      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Treasury</h1>
          <p className="text-gray-400 mt-1">
            Manage shared funds with multi-signature approvals
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowDeposit(true)}>+ Deposit</button>
      </div>

      {/* Balance Overview */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Total Balance</p>
            <p className="text-4xl font-bold text-white mt-1">— XLM</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Approval Threshold</p>
            <p className="text-2xl font-semibold text-primary-400 mt-1">
              — of —
            </p>
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Pending Transactions
        </h2>
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            Connect your wallet to view pending transactions
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">History</h2>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-stellar-border">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">To</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Approvals</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-8"
                  >
                    No transactions yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
