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
    const history = await prisma.symptomNoteHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, history });
  } catch (err) {
    console.error('Error fetching symptom history:', err);
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
    // Check if user has opted out of saving history
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { saveHistory: true },
    });
    if (profile && profile.saveHistory === false) {
      return NextResponse.json({
        success: true,
        saved: false,
        message: 'History auto-save is turned off in profile settings.',
      });
    }

    const body = await req.json();

    const groupId = String(body.groupId || '').slice(0, 30).trim();
    const departmentJa = String(body.departmentJa || '').slice(0, 60).trim();
    const departmentEn = String(body.departmentEn || '').slice(0, 60).trim();
    const urgency = String(body.urgency || '').slice(0, 40).trim();
    const noteJa = String(body.noteJa || '').slice(0, 4000).trim();
    const noteEn = String(body.noteEn || '').slice(0, 4000).trim();
    const answersJson = typeof body.answersJson === 'object' && body.answersJson !== null
      ? body.answersJson
      : {};

    if (!groupId || !departmentJa) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const record = await prisma.symptomNoteHistory.create({
      data: {
        userId,
        groupId,
        departmentJa,
        departmentEn: departmentEn || departmentJa,
        urgency: urgency || 'within_few_days',
        noteJa,
        noteEn,
        answersJson,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (err) {
    console.error('Error saving symptom history:', err);
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

    await prisma.symptomNoteHistory.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting symptom history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

