import { NextRequest, NextResponse } from 'next/server';
import { generateVisitPlan } from '@/lib/ai/generateVisitPlan';
import { dbService } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = generateVisitPlan(body);

    // Persist visit plan
    let savedPlan = null;
    if (body.save) {
      savedPlan = await dbService.saveVisitPlan({
        userId: body.userId || null,
        clinicId: body.clinicId || null,
        symptom_summary_ja: body.symptomSummary || 'General consultation',
        symptom_summary_en: body.symptomSummary || 'General consultation',
        symptom_summary_hi: body.symptomSummary || 'General consultation',
        visit_steps: result.steps,
        cost_estimate: result.costEstimate,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      savedPlanId: savedPlan?.id || null,
    });
  } catch (error: any) {
    console.error('Error generating visit plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
