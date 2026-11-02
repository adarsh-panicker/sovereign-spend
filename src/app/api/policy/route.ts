import { NextResponse, NextRequest } from 'next/server';
import { getPolicy, updatePolicy } from '@/lib/store';

export async function GET(request: NextRequest) {
  return NextResponse.json(getPolicy(), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = updatePolicy(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 400 });
  }
}
