import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getTransactions());
}
