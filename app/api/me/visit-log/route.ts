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
    const visits = await prisma.visitLog.findMany({
      where: { userId },
      orderBy: { visitedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, visits });
  } catch (err) {
    console.error('Error fetching visit log:', err);
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

    const clinicName = String(body.clinicName || '').slice(0, 200).trim();
    const clinicId = body.clinicId ? String(body.clinicId).slice(0, 100).trim() : null;
    const note = body.note ? String(body.note).slice(0, 1000).trim() : null;

    let visitedAt: Date;
    if (body.visitedAt) {
      const parsed = new Date(body.visitedAt);
      visitedAt = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      visitedAt = new Date();
    }

    if (!clinicName) {
      return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 });
    }

    const created = await prisma.visitLog.create({
      data: {
        userId,
        clinicName,
        clinicId,
        visitedAt,
        note,
      },
    });

    return NextResponse.json({ success: true, visit: created });
  } catch (err) {
    console.error('Error creating visit log entry:', err);
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

    await prisma.visitLog.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting visit log entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

