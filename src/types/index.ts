export interface PurchaseIntent {
  id: string;
  itemTitle: string;
  category: 'office' | 'electronics' | 'travel' | 'cloud' | 'supplies' | 'other';
  merchant: string;
  merchantVerified: boolean;
  unitPrice: number;
  quantity: number;
  estimatedTax: number;
  shipping: number;
  totalAmount: number;
  currency: string;
  reasoning: string;
  sourceUrl?: string;
  riskScore: number; // 0 - 100
}

export interface GuardrailPolicy {
  maxAutoApproveLimit: number; // e.g. 50 USD
  monthlyBudget: number; // e.g. 1000 USD
  spentThisMonth: number;
  allowedCategories: string[];
  blockedMerchants: string[];
  requireHumanApprovalAbove: number;
  riskScoreThreshold: number; // > 60 triggers review
}

export type DecisionType = 'AUTO_APPROVE' | 'REQUIRE_HUMAN_APPROVAL' | 'REJECT';

export interface PolicyEvaluationResult {
  decision: DecisionType;
  reasons: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
}

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  userPrompt: string;
  intent: PurchaseIntent;
  decision: DecisionType;
  decisionReasons: string[];
  status: 'CAPTURED_AUTONOMOUSLY' | 'PENDING_USER_APPROVAL' | 'USER_APPROVED' | 'USER_REJECTED';
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalMode: 'SANDBOX_LIVE' | 'SANDBOX_SIMULATED';
  approvalUrl?: string;
}
