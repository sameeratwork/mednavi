import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const clinic = await dbService.getClinicById(id);

    if (!clinic) {
      return NextResponse.json({ success: false, error: 'Clinic not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, clinic });
  } catch (error: any) {
    console.error('Error getting clinic:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
