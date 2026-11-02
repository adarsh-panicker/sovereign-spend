import { GuardrailPolicy, TransactionRecord } from '@/types';
import { DEFAULT_POLICY } from './guardrails';

// In-memory persistent state during server runtime
let currentPolicy: GuardrailPolicy = { ...DEFAULT_POLICY };

let transactions: TransactionRecord[] = [
  {
    id: 'TXN-901',
    timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
    userPrompt: 'Reorder ergonomic wireless mouse for developer workstation',
    intent: {
      id: 'PI-M01',
      itemTitle: 'Logitech MX Master 3S Wireless Mouse',
      category: 'electronics',
      merchant: 'Amazon Business',
      merchantVerified: true,
      unitPrice: 99.0,
      quantity: 1,
      estimatedTax: 8.16,
      shipping: 0,
      totalAmount: 107.16,
      currency: 'USD',
      reasoning: 'Routine ergonomic hardware upgrade for workspace.',
      riskScore: 22,
    },
    decision: 'REQUIRE_HUMAN_APPROVAL',
    decisionReasons: ['Total ($107.16) exceeds autonomous threshold ($50.00).'],
    status: 'USER_APPROVED',
    paypalOrderId: 'PAYPAL-SBX-8849201',
    paypalCaptureId: 'CAP-SBX-4920188',
    paypalMode: 'SANDBOX_SIMULATED',
    approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL-SBX-8849201',
  },
  {
    id: 'TXN-902',
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
    userPrompt: 'Order replacement thermal paper rolls for receipt printer under $20',
    intent: {
      id: 'PI-P02',
      itemTitle: 'BPA-Free Receipt Paper Rolls (50 Pack)',
      category: 'office',
      merchant: 'Staples Direct',
      merchantVerified: true,
      unitPrice: 18.25,
      quantity: 1,
      estimatedTax: 1.5,
      shipping: 0,
      totalAmount: 19.75,
      currency: 'USD',
      reasoning: 'Consumable office supplies reorder within pre-approved parameters.',
      riskScore: 8,
    },
    decision: 'AUTO_APPROVE',
    decisionReasons: [
      'Within autonomous spending allowance ($19.75 <= $50.00).',
      'Merchant verified and reputable (Staples Direct).',
    ],
    status: 'CAPTURED_AUTONOMOUSLY',
    paypalOrderId: 'PAYPAL-SBX-3319044',
    paypalCaptureId: 'CAP-SBX-9940123',
    paypalMode: 'SANDBOX_SIMULATED',
  },
];

export function getPolicy(): GuardrailPolicy {
  return currentPolicy;
}

export function updatePolicy(newPolicy: Partial<GuardrailPolicy>): GuardrailPolicy {
  currentPolicy = {
    ...currentPolicy,
    ...newPolicy,
  };
  return currentPolicy;
}

export function getTransactions(): TransactionRecord[] {
  return transactions;
}

export function addTransaction(record: TransactionRecord): TransactionRecord {
  transactions = [record, ...transactions];
  if (record.status === 'CAPTURED_AUTONOMOUSLY' || record.status === 'USER_APPROVED') {
    currentPolicy.spentThisMonth = Number(
      (currentPolicy.spentThisMonth + record.intent.totalAmount).toFixed(2)
    );
  }
  return record;
}

export function updateTransaction(id: string, updates: Partial<TransactionRecord>): TransactionRecord | null {
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const previous = transactions[index];
  const updated = { ...previous, ...updates };
  transactions[index] = updated;

  if (
    previous.status === 'PENDING_USER_APPROVAL' &&
    updated.status === 'USER_APPROVED'
  ) {
    currentPolicy.spentThisMonth = Number(
      (currentPolicy.spentThisMonth + updated.intent.totalAmount).toFixed(2)
    );
  }

  return updated;
}
