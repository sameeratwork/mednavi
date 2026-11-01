import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export async function DELETE(req: NextRequest) {
  const rl = checkRateLimit(req, 10, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete in sequence: all user-related records across tables
    await prisma.userProfile.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.symptomNoteHistory.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.savedClinic.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.visitLog.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.billHistory.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.medicalRecord.deleteMany({ where: { userId } }).catch(() => null);
    await prisma.visitPlan.deleteMany({ where: { userId } }).catch(() => null);

    // Finally delete the user row itself
    await prisma.user.deleteMany({ where: { id: userId } }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'All user data has been permanently deleted.',
    });
  } catch (err) {
    console.error('Error deleting all user data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

