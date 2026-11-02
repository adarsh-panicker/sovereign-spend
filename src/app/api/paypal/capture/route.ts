import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { updateTransaction, getTransactions } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { transactionId, action } = await req.json();

    const tx = getTransactions().find((t) => t.id === transactionId);
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (action === 'REJECT') {
      const updated = updateTransaction(transactionId, {
        status: 'USER_REJECTED',
        decisionReasons: [...tx.decisionReasons, 'Manually rejected by administrator.'],
      });
      return NextResponse.json({ success: true, transaction: updated });
    }

    // Action === 'APPROVE'
    const captureResult = await capturePayPalOrder(tx.paypalOrderId || `ORD-${tx.id}`);
    const updated = updateTransaction(transactionId, {
      status: 'USER_APPROVED',
      paypalCaptureId: captureResult.captureId,
      decisionReasons: [...tx.decisionReasons, 'Manually approved & captured via PayPal Sandbox.'],
    });

    return NextResponse.json({
      success: true,
      transaction: updated,
      captureResult,
    });
  } catch (error) {
    console.error('Error in capture endpoint:', error);
    return NextResponse.json({ error: 'Capture execution failed' }, { status: 500 });
  }
}
