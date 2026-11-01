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
    const items = await prisma.savedClinic.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const favorites: string[] = [];
    const wantToGo: string[] = [];

    for (const item of items) {
      if (item.status === 'favorite') {
        favorites.push(item.clinicId);
      } else if (item.status === 'want_to_go') {
        wantToGo.push(item.clinicId);
      }
    }

    return NextResponse.json({
      success: true,
      items,
      ids: {
        favorite: favorites,
        want_to_go: wantToGo,
      },
    });
  } catch (err) {
    console.error('Error fetching saved clinics:', err);
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

    const clinicId = String(body.clinicId || '').slice(0, 100).trim();
    const clinicName = String(body.clinicName || '').slice(0, 200).trim();
    const address = String(body.address || '').slice(0, 300).trim();
    const ward = body.ward ? String(body.ward).slice(0, 50).trim() : null;
    const status = body.status === 'want_to_go' ? 'want_to_go' : 'favorite';
    const departments = Array.isArray(body.departments) ? body.departments : null;

    if (!clinicId || !clinicName) {
      return NextResponse.json({ error: 'Invalid clinic details' }, { status: 400 });
    }

    // Toggle behavior: if already saved with this status, delete it
    const existing = await prisma.savedClinic.findUnique({
      where: {
        userId_clinicId_status: {
          userId,
          clinicId,
          status,
        },
      },
    });

    if (existing) {
      await prisma.savedClinic.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        saved: false,
        status,
        clinicId,
      });
    }

    const created = await prisma.savedClinic.create({
      data: {
        userId,
        clinicId,
        clinicName,
        address,
        ward,
        departments: departments || undefined,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
      status,
      clinicId,
      item: created,
    });
  } catch (err) {
    console.error('Error toggling saved clinic:', err);
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
    const clinicId = url.searchParams.get('clinicId');
    const status = url.searchParams.get('status');

    if (id) {
      await prisma.savedClinic.deleteMany({
        where: { id, userId },
      });
    } else if (clinicId) {
      await prisma.savedClinic.deleteMany({
        where: {
          userId,
          clinicId,
          ...(status ? { status } : {}),
        },
      });
    } else {
      return NextResponse.json({ error: 'Missing clinic identifier' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error removing saved clinic:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

