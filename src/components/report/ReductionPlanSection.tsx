'use client';

import { SectionCard } from './SectionCard';
import { H4 } from '../ui';
import type { ReportPreview as ReportPreviewType } from '../../app/types/report';
import { BadgeCheck, Sun, Car, Building } from 'lucide-react';
import type { ReactElement } from 'react';

interface Props {
  plan: ReportPreviewType['reductionPlan'];
}

export const ReductionPlanSection = ({ plan }: Props) => {
  if (!plan) return null;

  const iconMap: Record<string, ReactElement> = {
    renewable: <Sun className="text-primary" />,
    fleet: <Car className="text-primary" />,
    energy: <Building className="text-primary" />
  };

  return (
    <SectionCard title="Reduction Targets & Action Plan" onEdit={() => {}}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Targets */}
        <div>
          <H4 className="mb-4">2030 Targets</H4>
          <div className="space-y-4">
            {plan.targets.map((t, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{t.label}</span>
                  <span className={`text-sm px-2 py-1 rounded ${t.colorClasses}`}>{t.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${t.progress}%` }} />
                </div>
                <p className="text-sm text-gray-600">Current: {t.progress}% reduction achieved</p>
              </div>
            ))}
          </div>
        </div>

        {/* Initiatives */}
        <div>
          <H4 className="mb-4">Key Initiatives</H4>
          <div className="space-y-3">
            {plan.initiatives.map((i, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {iconMap[i.icon] ?? <BadgeCheck className="text-primary" />}
                <div>
                  <span className="font-medium text-gray-900">{i.name}</span>
                  <p className="text-sm text-gray-600">{i.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 