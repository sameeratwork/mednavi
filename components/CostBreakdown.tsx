'use client';

import React, { useState } from 'react';
import { BadgePercent, HelpCircle, Receipt, ShieldCheck } from 'lucide-react';

interface CostBreakdownProps {
  hasInsurance?: boolean;
  isFirstVisit?: boolean;
  isHospital?: boolean;
}

export default function CostBreakdown({
  hasInsurance = true,
  isFirstVisit = true,
  isHospital = false,
}: CostBreakdownProps) {
  const [insurance, setInsurance] = useState(hasInsurance);
  const [firstVisit, setFirstVisit] = useState(isFirstVisit);
  const [hospital, setHospital] = useState(isHospital);

  // MHLW Standard Consultation Points calculation
  // 1 point = 10 JPY
  // Copay = 30% for NHI holders
  const copayRate = insurance ? 0.3 : 1.0;

  // Points breakdown
  const consultPoints = firstVisit ? 288 : 73; // Shoshin (288 pts = 2,880 JPY) vs Saishin (73 pts = 730 JPY)
  const prescriptionPoints = 68; // Shohosen-ryo (68 pts = 680 JPY)
  const basicTestPoints = 200; // Blood/swab check (~2,000 JPY)

  const clinicSubtotalPoints = consultPoints + prescriptionPoints + basicTestPoints;
  const clinicTotalJpy = Math.round(clinicSubtotalPoints * 10 * copayRate);

  // Pharmacy estimate (3-day standard cold/pain treatment)
  const pharmacyJpy = Math.round(3500 * copayRate);

  // Extra hospital fee if visiting large hospital without referral
  const senteiFee = hospital && insurance ? 5500 : 0;

  const totalEstimate = clinicTotalJpy + pharmacyJpy + senteiFee;

  return (
    <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-brand-700 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-navy-950">
              Estimated Cost Breakdown (目安費用)
            </h3>
            <p className="text-xs text-navy-500">
              Based on official Ministry of Health, Labour and Welfare (MHLW) point rules
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
          {insurance ? '30% Patient Copay' : '100% Full Payment'}
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-navy-50 rounded-2xl mb-5 text-xs">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={insurance}
            onChange={(e) => setInsurance(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium text-navy-800">Japanese Insurance (NHI)</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={firstVisit}
            onChange={(e) => setFirstVisit(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium text-navy-800">First Visit (初診料)</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hospital}
            onChange={(e) => setHospital(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium text-navy-800">Major Hospital (病院)</span>
        </label>
      </div>

      {/* Line Items Table */}
      <div className="space-y-2.5 text-xs text-navy-700 mb-6">
        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <div>
            <span className="font-semibold text-navy-900">
              {firstVisit ? 'Initial Consultation (初診料)' : 'Follow-up Consultation (再診料)'}
            </span>
            <span className="text-navy-400 text-[10px] ml-1.5">
              ({consultPoints} pts = ¥{(consultPoints * 10).toLocaleString()})
            </span>
          </div>
          <span className="font-bold text-navy-900">
            ¥{Math.round(consultPoints * 10 * copayRate).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <div>
            <span className="font-semibold text-navy-900">Prescription Voucher Fee (処方箋料)</span>
            <span className="text-navy-400 text-[10px] ml-1.5">
              ({prescriptionPoints} pts = ¥{(prescriptionPoints * 10).toLocaleString()})
            </span>
          </div>
          <span className="font-bold text-navy-900">
            ¥{Math.round(prescriptionPoints * 10 * copayRate).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <div>
            <span className="font-semibold text-navy-900">Basic Diagnostics / Swab Test (検査料)</span>
            <span className="text-navy-400 text-[10px] ml-1.5">(Approx. 200 pts)</span>
          </div>
          <span className="font-bold text-navy-900">
            ¥{Math.round(basicTestPoints * 10 * copayRate).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <div>
            <span className="font-semibold text-navy-900">Dispensing Pharmacy (調剤薬局)</span>
            <span className="text-navy-400 text-[10px] ml-1.5">(Paid separately at pharmacy)</span>
          </div>
          <span className="font-bold text-navy-900">
            ¥{pharmacyJpy.toLocaleString()}
          </span>
        </div>

        {senteiFee > 0 && (
          <div className="flex justify-between items-center py-1.5 border-b border-emergency-100 bg-emergency-50/50 px-2 rounded-lg">
            <div>
              <span className="font-semibold text-emergency-900">Non-referral Hospital Fee (選定療養費)</span>
              <span className="text-emergency-600 text-[10px] ml-1.5">(Charged by large hospitals)</span>
            </div>
            <span className="font-bold text-emergency-900">
              ¥{senteiFee.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Total Banner */}
      <div className="bg-brand-50 rounded-2xl p-4 border border-brand-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-brand-800">Total Out-of-Pocket Estimate</span>
          <p className="text-[11px] text-brand-700">Cash recommended at reception</p>
        </div>
        <div className="text-right">
          <span className="font-heading font-black text-2xl text-brand-900">
            ¥{totalEstimate.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
