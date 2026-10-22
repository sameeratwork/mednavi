import { NextRequest, NextResponse } from 'next/server';
import { explainBillAndPrescription } from '@/lib/ai/explainBill';
import { dbService } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await explainBillAndPrescription(body);

    // Save medical record
    let savedRecord = null;
    if (body.save) {
      savedRecord = await dbService.saveMedicalRecord({
        userId: body.userId || null,
        type: body.prescriptionText ? 'prescription' : 'bill',
        input_text: body,
        explanation_en: result.summary_en,
        explanation_hi: result.summary_hi,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      recordId: savedRecord?.id || null,
    });
  } catch (error: any) {
    console.error('Error in explain bill API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
