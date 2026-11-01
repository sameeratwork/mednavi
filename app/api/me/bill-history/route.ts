import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bills = await prisma.billHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, bills });
  } catch (err) {
    console.error('Error fetching bill history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const kind = body.kind === 'medicine' ? 'medicine' : 'bill';
    const title = String(body.title || 'Medical Explainer Note').slice(0, 150).trim();
    const summaryJson = typeof body.summaryJson === 'object' && body.summaryJson !== null
      ? body.summaryJson
      : {};

    const created = await prisma.billHistory.create({
      data: {
        userId,
        kind,
        title,
        summaryJson,
      },
    });

    return NextResponse.json({ success: true, bill: created });
  } catch (err) {
    console.error('Error saving bill history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const rl = checkRateLimit(req, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.billHistory.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting bill history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

