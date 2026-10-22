import { NextRequest, NextResponse } from 'next/server';
import { generateSymptomSummary } from '@/lib/ai/generateSymptomSummary';
import { dbService } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateSymptomSummary(body);

    // Persist to visit plans if requested
    let savedPlan = null;
    if (body.save) {
      savedPlan = await dbService.saveVisitPlan({
        userId: body.userId || null,
        clinicId: body.clinicId || null,
        symptom_summary_ja: result.summary_ja,
        symptom_summary_en: result.summary_en,
        symptom_summary_hi: result.summary_hi,
        visit_steps: result.questionsForDoctor,
        cost_estimate: { urgency: result.urgencyLevel, department: result.suggestedDepartment },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      savedPlanId: savedPlan?.id || null,
    });
  } catch (error: any) {
    console.error('Error generating symptom summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
