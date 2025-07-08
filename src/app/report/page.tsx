"use client";

import { useEffect, useState } from 'react';
import { getReportPreview } from '../../../api';
import type { ReportPreview as ReportPreviewType } from '@/app/types/report';
import { ReportActions } from '@/components/report/ReportActions';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ExecutiveSummarySection } from '@/components/report/ExecutiveSummarySection';
import { Scope2Section } from '@/components/report/Scope2Section';
import { Scope1Section } from '@/components/report/Scope1Section';
import { Scope3Section } from '@/components/report/Scope3Section';
import { ReductionPlanSection } from '@/components/report/ReductionPlanSection';


export default function ReportPage() {
  const [data, setData] = useState<ReportPreviewType | null>(null);

  useEffect(() => {
    getReportPreview(1).then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <p className="p-4">Loading...</p>;
  }
  
  const { summary, emissionsBreakdown, scope1, scope2, scope3, reductionPlan } = data;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 space-y-8">
      <ReportActions />
      <div className="space-y-8 shadow-lg rounded-lg">
        {/* Header */}
        <ReportHeader title="Carbon Footprint Report 2025" description="Annual Environmental Impact Assessment" lastUpdated="Dec 2025" />

        <ExecutiveSummarySection summary={summary} emissionsBreakdown={emissionsBreakdown} />

        <Scope1Section scope1={scope1} />

        {/* Months list is shared with scope1 data in this mock structure */}
        <Scope2Section scope2={scope2} months={scope1.monthly.months} />

        <Scope3Section scope3={scope3} />

        {reductionPlan && <ReductionPlanSection plan={reductionPlan} />}
      </div>
    </div>
  );
}
