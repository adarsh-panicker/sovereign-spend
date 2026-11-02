'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Lock,
  Layers,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { GuardrailPolicy, TransactionRecord, AgentStep } from '@/types';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [latestTx, setLatestTx] = useState<TransactionRecord | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [policy, setPolicy] = useState<GuardrailPolicy>({
    maxAutoApproveLimit: 50,
    monthlyBudget: 1500,
    spentThisMonth: 342.5,
    allowedCategories: ['office', 'electronics', 'cloud', 'supplies', 'travel', 'other'],
    blockedMerchants: ['sketchy-deals-discount.xyz', 'crypto-fast-pay.biz', 'unverified-reseller.io'],
    requireHumanApprovalAbove: 50,
    riskScoreThreshold: 60,
  });
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load initial policy and transactions
  useEffect(() => {
    fetch('/api/policy')
      .then((res) => res.json())
      .then((data) => setPolicy(data))
      .catch((err) => console.error(err));

    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        if (data.length > 0) {
          setLatestTx(data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleProcure = async (inputPrompt?: string) => {
    const textToSubmit = inputPrompt || prompt;
    if (!textToSubmit.trim() || loading) return;

    setLoading(true);
    setActiveSteps([
      {
        id: 'init',
        title: 'Initializing Autonomous Agent',
        description: `Dispatched intent: "${textToSubmit}"`,
        status: 'running',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    try {
      const res = await fetch('/api/agent/procure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSubmit }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveSteps(data.steps);
        setLatestTx(data.transaction);
        setPolicy(data.policy);
        setTransactions((prev) => [data.transaction, ...prev]);
        setPrompt('');
      } else {
        alert(data.error || 'Failed to execute procurement');
      }
    } catch (err) {
      console.error(err);
      alert('Network error executing agent loop');
    } finally {
      setLoading(false);
    }
  };

  const handleHumanApproval = async (transactionId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh transactions and policy
        const txRes = await fetch('/api/transactions');
        const updatedTxList = await txRes.json();
        setTransactions(updatedTxList);
        const currentUpdated = updatedTxList.find((t: TransactionRecord) => t.id === transactionId);
        if (currentUpdated) setLatestTx(currentUpdated);

        const polRes = await fetch('/api/policy');
        const updatedPol = await polRes.json();
        setPolicy(updatedPol);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const updateAutoCap = async (newLimit: number) => {
    const updated = { ...policy, maxAutoApproveLimit: newLimit, requireHumanApprovalAbove: newLimit };
    setPolicy(updated);
    try {
      await fetch('/api/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxAutoApproveLimit: newLimit, requireHumanApprovalAbove: newLimit }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const samplePrompts = [
    {
      text: 'Reorder 2 bags of Blue Bottle Espresso coffee beans under $40',
      badge: 'Auto-Approves (< $50)',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      text: 'Book roundtrip airfare to San Francisco for PayPal Hackathon under $350',
      badge: 'Escalates to Human (> $50)',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      text: 'Purchase 40 hours of Cloud GPU compute credits for $44',
      badge: 'Auto-Approves (< $50)',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      text: 'Order 4K webcam from sketchy-deals-discount.xyz under $45',
      badge: 'Guardrail Blocked',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  const budgetPercentage = Math.min(100, Math.round((policy.spentThisMonth / policy.monthlyBudget) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900/90 border border-blue-500/40 p-1 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <img src="/logo.svg" alt="SovereignSpend Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SovereignSpend
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Agentic Commerce
                </span>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hidden sm:inline-flex items-center gap-1">
                  By <strong className="text-white font-semibold">Adarsh Panicker</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guardrailed Autonomous Procurement via PayPal Vault &amp; Sandbox v2
              </p>
            </div>
          </div>

          {/* Connection Status & Budget Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PayPal Sandbox Connected</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Vault Token: <span className="font-mono text-slate-100">sbx_vault_9401</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Prompting & Agent Pipeline (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Agent Command Box */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="procurement-intent" className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <Bot className="w-4 h-4 text-blue-400" />
                Autonomous Procurement Intent
              </label>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Natural Language to PayPal Checkout
              </span>
            </div>

            <div className="relative">
              <textarea
                id="procurement-intent"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Instruct your agent: 'Order 2 packs of organic coffee beans under $35' or 'Book roundtrip flights to SF under $350'..."
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              />
              <button
                onClick={() => handleProcure()}
                disabled={loading || !prompt.trim()}
                className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing Agent...
                  </>
                ) : (
                  <>
                    <span>Execute Intent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Prompts */}
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <div className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Interactive Test Scenarios
              </div>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(sp.text);
                      handleProcure(sp.text);
                    }}
                    disabled={loading}
                    className="text-left group text-xs bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg p-2 transition-all flex flex-col gap-1"
                  >
                    <span className="text-slate-300 group-hover:text-white line-clamp-1">{sp.text}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border self-start ${sp.badgeColor}`}>
                      {sp.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Human Approval Required Action Card (if latest is pending) */}
          {latestTx && latestTx.status === 'PENDING_USER_APPROVAL' && (
            <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                      Human-In-The-Loop Approval Required
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      Exceeds Auto-Cap (${policy.maxAutoApproveLimit.toFixed(2)})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2">
                    The autonomous agent found matching options, but this transaction requires cryptographic authorization before PayPal Vault capture.
                  </p>

                  <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Item:</span>
                      <span className="font-semibold text-white">{latestTx.intent.itemTitle}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Merchant:</span>
                      <span className="font-semibold text-white">{latestTx.intent.merchant}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>PayPal Sandbox Order ID:</span>
                      <span className="font-mono text-blue-400">{latestTx.paypalOrderId}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span className="font-bold text-slate-200">Total Disbursement:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        ${latestTx.intent.totalAmount.toFixed(2)} {latestTx.intent.currency}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleHumanApproval(latestTx.id, 'APPROVE')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize &amp; Capture via PayPal</span>
                    </button>
                    <button
                      onClick={() => handleHumanApproval(latestTx.id, 'REJECT')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Agent Reasoning Pipeline */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <Layers className="w-4 h-4 text-indigo-400" />
                Live Agent Execution &amp; Guardrail Pipeline
              </h2>
              {loading && (
                <span className="text-xs text-blue-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing Pipeline...
                </span>
              )}
            </div>

            {activeSteps.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Select an interactive scenario above or enter a custom prompt to watch the autonomous agent reason, enforce guardrails, and execute PayPal sandbox transactions.
              </div>
            ) : (
              <div className="space-y-3">
                {activeSteps.map((step, index) => {
                  const isLast = index === activeSteps.length - 1;
                  return (
                    <div
                      key={step.id || index}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        step.status === 'completed'
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                          : step.status === 'running'
                          ? 'bg-blue-950/20 border-blue-500/40 text-blue-200 shadow-md shadow-blue-500/10'
                          : step.status === 'paused'
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {step.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
                          {step.status === 'paused' && <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
                          {step.status === 'failed' && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
                          <span className="text-white">{step.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-400 pl-6 leading-relaxed">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Policy Controls & Audit Ledger (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Guardrails Policy Manager */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <Settings className="w-4 h-4 text-blue-400" />
                Active Guardrail Policy
              </h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Live Constraints
              </span>
            </div>

            {/* Auto-Approve Threshold Slider */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="auto-spend-limit" className="text-slate-300 font-medium">Autonomous Spend Cap / Order</label>
                <span className="font-bold text-blue-400 font-mono text-sm">
                  ${policy.maxAutoApproveLimit.toFixed(2)}
                </span>
              </div>
              <input
                id="auto-spend-limit"
                type="range"
                min="10"
                max="200"
                step="5"
                value={policy.maxAutoApproveLimit}
                onChange={(e) => updateAutoCap(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$10 (Strict)</span>
                <span>$50 (Balanced)</span>
                <span>$200 (Permissive)</span>
              </div>
            </div>

            {/* Monthly Velocity & Budget Progress */}
            <div className="space-y-2 mb-5 pt-3 border-t border-slate-800/60">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Monthly Allowance Consumption</span>
                <span className="font-mono text-slate-400">
                  <span className="text-white font-bold">${policy.spentThisMonth.toFixed(2)}</span> / ${policy.monthlyBudget}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetPercentage > 85
                      ? 'bg-rose-500'
                      : budgetPercentage > 60
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Remaining autonomous pool: ${(policy.monthlyBudget - policy.spentThisMonth).toFixed(2)}
              </p>
            </div>

            {/* Allowed Categories & Blocked Domains */}
            <div className="pt-3 border-t border-slate-800/60 space-y-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Permitted Agent Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {policy.allowedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 capitalize"
                    >
                      ✓ {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Enforced Merchant Blocklist</span>
                <div className="space-y-1">
                  {policy.blockedMerchants.map((merchant) => (
                    <div
                      key={merchant}
                      className="text-[10px] text-rose-400/90 font-mono bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 flex items-center justify-between"
                    >
                      <span>🚫 {merchant}</span>
                      <span className="text-[9px] uppercase tracking-wider text-rose-400/60">Blocked</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Ledger & Transaction History */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                PayPal Sandbox Audit Ledger
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {transactions.length} records
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {transactions.map((tx) => {
                const isExpanded = expandedTxId === tx.id;
                return (
                  <div
                    key={tx.id}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs hover:border-slate-700 transition-all cursor-pointer"
                    onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span>{tx.intent.itemTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          via <span className="text-slate-300 font-medium">{tx.intent.merchant}</span> • {tx.timestamp}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-white font-mono">
                          ${tx.intent.totalAmount.toFixed(2)}
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider inline-block mt-0.5 ${
                            tx.status === 'CAPTURED_AUTONOMOUSLY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'USER_APPROVED'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : tx.status === 'PENDING_USER_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">PayPal Order ID:</span>
                          <span className="font-mono text-blue-400">{tx.paypalOrderId || 'N/A'}</span>
                        </div>
                        {tx.paypalCaptureId && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">PayPal Capture ID:</span>
                            <span className="font-mono text-emerald-400">{tx.paypalCaptureId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mode:</span>
                          <span className="font-mono text-slate-400">{tx.paypalMode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Risk Assessment:</span>
                          <span className="font-medium text-slate-300">{tx.intent.riskScore}/100</span>
                        </div>
                        <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
                          <strong>Guardrail Engine notes:</strong> {tx.decisionReasons.join(' ')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 w-full">
          <div>
            Built for the <strong className="text-slate-300">PayPal AI Hackathon 2026</strong> • Autonomous Agentic Commerce Track
          </div>
          <div className="flex items-center gap-3">
            <span>Architected &amp; Built by <strong className="text-slate-200">Adarsh Panicker</strong></span>
            <a
              href="https://github.com/adarsh-panicker"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
            >
              github.com/adarsh-panicker
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
