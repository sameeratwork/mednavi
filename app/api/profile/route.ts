import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, nationality, japanese_level, languages, city, insurance_type, constraints } = body;

    const savedUser = await dbService.saveUser({
      email: email || 'resident@mednavi.jp',
      name: name || 'Foreign Resident',
      nationality: nationality || 'India',
      japanese_level: japanese_level || 'none',
      languages: languages || ['en', 'hi'],
      city: city || 'Tokyo',
      insurance_type: insurance_type || 'National Health Insurance',
      constraints: constraints || [],
    });

    return NextResponse.json({ success: true, user: savedUser });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
