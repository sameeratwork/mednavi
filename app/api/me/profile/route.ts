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
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          language: 'en',
          ward: 'Shinjuku',
          nationality: 'India',
          insuranceType: 'National Health Insurance',
          saveHistory: true,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        name: user?.name || session?.user?.name || '',
        email: user?.email || session?.user?.email || '',
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const allowedLanguages = ['en', 'ja', 'hi'];
    const language = typeof body.language === 'string' && allowedLanguages.includes(body.language)
      ? body.language
      : undefined;

    const ward = typeof body.ward === 'string'
      ? body.ward.slice(0, 50).trim()
      : undefined;

    const nationality = typeof body.nationality === 'string'
      ? body.nationality.slice(0, 50).trim()
      : undefined;

    const insuranceType = typeof body.insuranceType === 'string'
      ? body.insuranceType.slice(0, 50).trim()
      : undefined;

    const saveHistory = typeof body.saveHistory === 'boolean'
      ? body.saveHistory
      : undefined;

    const updateData: Record<string, any> = {};
    if (language !== undefined) updateData.language = language;
    if (ward !== undefined) updateData.ward = ward;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (insuranceType !== undefined) updateData.insuranceType = insuranceType;
    if (saveHistory !== undefined) updateData.saveHistory = saveHistory;

    const updated = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        language: language || 'en',
        ward: ward || null,
        nationality: nationality || null,
        insuranceType: insuranceType || null,
        saveHistory: saveHistory ?? true,
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
