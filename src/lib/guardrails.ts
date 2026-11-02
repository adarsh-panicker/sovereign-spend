import { GuardrailPolicy, PurchaseIntent, PolicyEvaluationResult } from '@/types';

export const DEFAULT_POLICY: GuardrailPolicy = {
  maxAutoApproveLimit: 50.0, // Default autonomous cap: $50
  monthlyBudget: 1500.0,
  spentThisMonth: 342.5,
  allowedCategories: ['office', 'electronics', 'cloud', 'supplies', 'travel', 'other'],
  blockedMerchants: ['sketchy-deals-discount.xyz', 'crypto-fast-pay.biz', 'unverified-reseller.io'],
  requireHumanApprovalAbove: 50.0,
  riskScoreThreshold: 60,
};

export function evaluateGuardrails(intent: PurchaseIntent, policy: GuardrailPolicy): PolicyEvaluationResult {
  const flags: string[] = [];
  const reasons: string[] = [];
  let isRejected = false;
  let requiresApproval = false;

  // 1. Merchant blocklist
  const isMerchantBlocked = policy.blockedMerchants.some(
    (blocked) => intent.merchant.toLowerCase().includes(blocked.toLowerCase())
  );
  if (isMerchantBlocked) {
    flags.push('BLOCKED_MERCHANT');
    reasons.push(`Merchant '${intent.merchant}' is on the organizational blacklist.`);
    isRejected = true;
  }

  // 2. Monthly Budget Cap
  if (policy.spentThisMonth + intent.totalAmount > policy.monthlyBudget) {
    flags.push('EXCEEDS_MONTHLY_BUDGET');
    reasons.push(
      `Transaction of $${intent.totalAmount.toFixed(2)} exceeds remaining monthly budget of $${(
        policy.monthlyBudget - policy.spentThisMonth
      ).toFixed(2)}.`
    );
    requiresApproval = true;
  }

  // 3. Auto-approval spending limit
  if (intent.totalAmount > policy.maxAutoApproveLimit) {
    flags.push('EXCEEDS_AUTO_SPEND_LIMIT');
    reasons.push(
      `Total ($${intent.totalAmount.toFixed(2)}) exceeds autonomous threshold ($${policy.maxAutoApproveLimit.toFixed(2)}).`
    );
    requiresApproval = true;
  }

  // 4. Category checks
  if (!policy.allowedCategories.includes(intent.category)) {
    flags.push('RESTRICTED_CATEGORY');
    reasons.push(`Category '${intent.category}' requires human review.`);
    requiresApproval = true;
  }

  // 5. Merchant verification
  if (!intent.merchantVerified) {
    flags.push('UNVERIFIED_MERCHANT');
    reasons.push(`Merchant '${intent.merchant}' does not have verified PayPal merchant credentials.`);
    if (intent.totalAmount > 20) {
      requiresApproval = true;
    }
  }

  // 6. Risk Score Anomaly
  if (intent.riskScore >= policy.riskScoreThreshold) {
    flags.push('HIGH_RISK_ANOMALY');
    reasons.push(`Risk score (${intent.riskScore}/100) indicates price or velocity anomaly.`);
    requiresApproval = true;
  }

  // Determine overall risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (intent.riskScore >= 70 || isRejected) {
    riskLevel = 'HIGH';
  } else if (intent.riskScore >= 40 || requiresApproval) {
    riskLevel = 'MEDIUM';
  }

  if (isRejected) {
    return {
      decision: 'REJECT',
      reasons,
      riskLevel: 'HIGH',
      flags,
    };
  }

  if (requiresApproval) {
    return {
      decision: 'REQUIRE_HUMAN_APPROVAL',
      reasons,
      riskLevel,
      flags,
    };
  }

  return {
    decision: 'AUTO_APPROVE',
    reasons: [
      `Within autonomous spending allowance ($${intent.totalAmount.toFixed(2)} <= $${policy.maxAutoApproveLimit.toFixed(2)}).`,
      `Merchant verified and reputable (${intent.merchant}).`,
      `Risk score is low (${intent.riskScore}/100).`,
    ],
    riskLevel: 'LOW',
    flags: [],
  };
}
