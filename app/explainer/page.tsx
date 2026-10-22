'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Pill, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Clock,
  Languages
} from 'lucide-react';

export default function BillExplainerPage() {
  const [totalAmount, setTotalAmount] = useState<number | ''>(2850);
  const [patientPortion, setPatientPortion] = useState<number | ''>(860);
  const [billText, setBillText] = useState('初診料 288点, 処方箋料 68点, 検査料 200点 (合計 556点)');
  const [prescriptionText, setPrescriptionText] = useState('カロナール錠500 1回1錠 毎食後 3日分\nロキソニン錠60mg 1回1錠 疼痛時 10回分\nムコスタ錠100mg 1回1錠 毎食後 3日分');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Quick Preset Samples
  const loadPreset = (type: 'cold' | 'pain' | 'hospital') => {
    if (type === 'cold') {
      setTotalAmount(2850);
      setPatientPortion(860);
      setBillText('初診料 288点, 処方箋料 68点 (合計 356点)');
      setPrescriptionText('カロナール錠500mg 1日3回 毎食後 3日分\nムコスタ錠100mg 1日3回 毎食後 3日分\nPL配合顆粒 1日3回 毎食後 3日分');
    } else if (type === 'pain') {
      setTotalAmount(3200);
      setPatientPortion(960);
      setBillText('初診料 288点, 処方箋料 68点, 外来管理加算 52点');
      setPrescriptionText('ロキソニン錠60mg 1回1錠 毎食後 5日分\nムコスタ錠100mg 1回1錠 毎食後 5日分');
    } else {
      setTotalAmount(8500);
      setPatientPortion(2550);
      setBillText('再診料 73点, 末梢血液一般 21点, 生化学的検査 180点, 処方箋料 68点');
      setPrescriptionText('クラビット錠500mg 1日1回 朝食後 5日分\nビオフェルミンR錠 1日3回 毎食後 5日分');
    }
  };

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/explain-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: totalAmount || undefined,
          patientPortion: patientPortion || undefined,
          billText,
          prescriptionText,
          save: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('Error in explain bill:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bilingual Healthcare Decipherer</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy-950">
          Medical Bill & Prescription Explainer
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Confused by your Japanese medical receipt (領収書) or pharmacy prescription (処方箋)? Input your items to get clear English and Hindi explanations, including comparisons with familiar Indian medications.
        </p>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-navy-500 font-medium">Try common samples:</span>
        <button
          type="button"
          onClick={() => loadPreset('cold')}
          className="px-3 py-1.5 rounded-xl bg-white border border-navy-200 hover:border-brand-300 font-semibold text-navy-700 shadow-2xs transition-colors"
        >
          💊 Fever / Cold (Calonal & Mucosta)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('pain')}
          className="px-3 py-1.5 rounded-xl bg-white border border-navy-200 hover:border-brand-300 font-semibold text-navy-700 shadow-2xs transition-colors"
        >
          ⚡ Joint / Painkiller (Loxonin & Stomach shield)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('hospital')}
          className="px-3 py-1.5 rounded-xl bg-white border border-navy-200 hover:border-brand-300 font-semibold text-navy-700 shadow-2xs transition-colors"
        >
          🏥 Lab Blood Test Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card">
          <form onSubmit={handleExplain} className="space-y-6">
            
            {/* Bill Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1">
                  Total Bill Amount (¥)
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 2850"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1">
                  Patient Copay 30% (一部負担金)
                </label>
                <input
                  type="number"
                  value={patientPortion}
                  onChange={(e) => setPatientPortion(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 860"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Receipt Line Items */}
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Receipt Line Items or Points (診療明細書の内容)
              </label>
              <textarea
                rows={3}
                value={billText}
                onChange={(e) => setBillText(e.target.value)}
                placeholder="e.g. 初診料 288点, 処方箋料 68点, 検査 200点"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[11px] text-navy-400 mt-1">
                Copy from your paper receipt. In Japan, 1 point = 10 JPY.
              </p>
            </div>

            {/* Prescription Medicine Text */}
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Prescription Medicine Names (処方箋の薬品名・服用方法)
              </label>
              <textarea
                rows={4}
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="e.g. カロナール錠500 1回1錠 毎食後 3日分"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
              <p className="text-[11px] text-navy-400 mt-1">
                Japanese medicine names (Calonal, Loxonin, Mucosta, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-float transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Explaining Bill & Medicines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Charges & Indian Equivalents</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Overview Summary */}
              <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-card space-y-3">
                <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Japanese Healthcare System Explanation</span>
                </h3>
                <p className="text-xs text-navy-700 leading-relaxed">
                  {result.summary_en}
                </p>
                {result.summary_hi && (
                  <div className="pt-2 border-t border-navy-100 text-xs text-navy-600 font-sans leading-relaxed">
                    <p className="font-bold text-navy-800 text-[11px] mb-0.5">🇮🇳 हिन्दी में सारांश:</p>
                    <p>{result.summary_hi}</p>
                  </div>
                )}
              </div>

              {/* Bill Items Breakdown */}
              {result.billBreakdown && result.billBreakdown.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-4">
                  <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-brand-600" />
                    <span>Receipt Charges Breakdown</span>
                  </h3>
                  <div className="space-y-3">
                    {result.billBreakdown.map((item: any, i: number) => (
                      <div key={i} className="p-3.5 bg-navy-50/70 rounded-2xl text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-navy-900">{item.item}</span>
                          <span className="font-bold text-brand-800">{item.estimatedCost}</span>
                        </div>
                        <p className="font-jp text-[11px] text-navy-500">{item.item_ja}</p>
                        <p className="text-navy-700 leading-relaxed pt-1">{item.explanation_en}</p>
                        {item.explanation_hi && (
                          <p className="text-navy-600 text-[11px] font-sans pt-0.5">{item.explanation_hi}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines Explainer with Indian Equivalents */}
              {result.medicines && result.medicines.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-4">
                  <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-teal-600" />
                    <span>Prescribed Japanese Medications</span>
                  </h3>

                  <div className="space-y-4">
                    {result.medicines.map((med: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl border border-navy-200 bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-navy-950 block">{med.name_en}</span>
                            <span className="font-jp text-navy-500 text-[11px]">{med.name_ja}</span>
                          </div>
                          {med.indianEquivalent && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              🇮🇳 Like {med.indianEquivalent.split('/')[0]}
                            </span>
                          )}
                        </div>

                        {/* Indian Equivalent Banner */}
                        <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-amber-950">
                          <span className="font-bold block text-[11px]">Indian Medicine Equivalent:</span>
                          <p className="text-xs font-semibold text-amber-900">{med.indianEquivalent}</p>
                        </div>

                        {/* Purpose & How to take */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="p-2 rounded-lg bg-navy-50">
                            <span className="text-navy-400 font-bold block uppercase text-[9px]">Purpose</span>
                            <span className="text-navy-800 font-medium">{med.purpose}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-brand-50/60">
                            <span className="text-brand-700 font-bold block uppercase text-[9px]">How to Take</span>
                            <span className="text-brand-900 font-medium">{med.howToTake}</span>
                          </div>
                        </div>

                        {med.sideEffects && (
                          <p className="text-[11px] text-navy-500 pt-0.5">
                            <span className="font-semibold text-navy-700">Side effects / Note:</span> {med.sideEffects}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-navy-50/70 border-2 border-dashed border-navy-200 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-14 h-14 rounded-2xl bg-white text-brand-600 flex items-center justify-center shadow-sm">
                <Receipt className="w-7 h-7" />
              </div>
              <div className="max-w-sm">
                <h3 className="font-heading font-bold text-base text-navy-900">
                  Bill & Prescription Explanations
                </h3>
                <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                  Enter your receipt charges or choose a preset sample on the left. MedNavi breaks down Japanese consultation points and translates medications with Indian equivalents.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
