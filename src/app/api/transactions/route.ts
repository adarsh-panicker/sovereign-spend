import { NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/store';

export async function GET(request: Request) {
  // Dynamic header access ensures no static build caching
  const userAgent = request.headers.get('user-agent') || '';
  return NextResponse.json(getTransactions(), {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addTransaction(body);
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 400 });
  }
}
