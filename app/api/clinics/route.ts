import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const language = searchParams.get('language') || undefined;
    const specialty = searchParams.get('specialty') || undefined;
    const query = searchParams.get('query') || undefined;
    const city = searchParams.get('city') || undefined;
    const ward = searchParams.get('ward') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : 100;
    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(parseInt(pageParam, 10), 1) : 1;

    const { clinics, total } = await dbService.getClinics({
      type,
      language,
      specialty,
      query,
      city,
      ward,
      limit,
      page,
    });

    return NextResponse.json({ success: true, count: clinics.length, total, page, clinics });
  } catch (error: any) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
