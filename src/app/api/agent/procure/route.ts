import { NextResponse } from 'next/server';
import { executeProcurementAgent } from '@/lib/agent';
import { evaluateGuardrails } from '@/lib/guardrails';
import { createPayPalOrder, capturePayPalOrder } from '@/lib/paypal';
import { getPolicy, addTransaction } from '@/lib/store';
import { TransactionRecord } from '@/types';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Agent decomposes prompt and formulates intent
    const { intent, steps } = await executeProcurementAgent(prompt);

    // 2. Evaluate against active organizational guardrails
    const policy = getPolicy();
    const evaluation = evaluateGuardrails(intent, policy);

    // Step: Guardrail evaluation
    steps.push({
      id: 'step-4',
      title: 'Evaluating SovereignSpend Guardrails',
      description: evaluation.decision === 'AUTO_APPROVE'
        ? `Passed autonomous thresholds: $${intent.totalAmount.toFixed(2)} <= $${policy.maxAutoApproveLimit.toFixed(2)} cap.`
        : evaluation.decision === 'REQUIRE_HUMAN_APPROVAL'
        ? `Triggered Human-In-The-Loop review: ${evaluation.reasons.join(' ')}`
        : `Policy Rejection: ${evaluation.reasons.join(' ')}`,
      status: evaluation.decision === 'REJECT' ? 'failed' : 'completed',
      timestamp: new Date().toLocaleTimeString(),
      metadata: { evaluation },
    });

    // 3. Initiate PayPal Sandbox Order
    const paypalOrder = await createPayPalOrder(intent);

    steps.push({
      id: 'step-5',
      title: 'PayPal Sandbox Order Generation',
      description: `Created Order ${paypalOrder.id} (${paypalOrder.mode}). Status: ${paypalOrder.status}`,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString(),
      metadata: { orderId: paypalOrder.id, mode: paypalOrder.mode },
    });

    let status: TransactionRecord['status'] = 'PENDING_USER_APPROVAL';
    let captureId: string | undefined = undefined;

    // 4. Autonomous Execution or Human-In-The-Loop
    if (evaluation.decision === 'AUTO_APPROVE') {
      // Auto-capture payment using tokenized PayPal Vault
      const captureResult = await capturePayPalOrder(paypalOrder.id);
      captureId = captureResult.captureId;
      status = 'CAPTURED_AUTONOMOUSLY';

      steps.push({
        id: 'step-6',
        title: 'Autonomous Fund Disbursement (PayPal Vault)',
        description: `Successfully captured $${intent.totalAmount.toFixed(2)} via tokenized PayPal payment agreement. Capture ID: ${captureId}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
        metadata: { captureId },
      });
    } else if (evaluation.decision === 'REQUIRE_HUMAN_APPROVAL') {
      steps.push({
        id: 'step-6',
        title: 'Awaiting Human-In-The-Loop Signoff',
        description: `Transaction parked. One-tap cryptographic authorization requested for user approval.`,
        status: 'paused',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      status = 'USER_REJECTED';
      steps.push({
        id: 'step-6',
        title: 'Transaction Blocked by Guardrail Engine',
        description: `Blocked: ${evaluation.reasons.join(' ')}`,
        status: 'failed',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    const transactionRecord: TransactionRecord = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString(),
      userPrompt: prompt,
      intent,
      decision: evaluation.decision,
      decisionReasons: evaluation.reasons,
      status,
      paypalOrderId: paypalOrder.id,
      paypalCaptureId: captureId,
      paypalMode: paypalOrder.mode,
      approvalUrl: paypalOrder.approvalUrl,
    };

    addTransaction(transactionRecord);

    return NextResponse.json({
      success: true,
      transaction: transactionRecord,
      steps,
      evaluation,
      policy: getPolicy(),
    });
  } catch (error) {
    console.error('Procurement error:', error);
    return NextResponse.json({ error: 'Failed to process autonomous procurement' }, { status: 500 });
  }
}
