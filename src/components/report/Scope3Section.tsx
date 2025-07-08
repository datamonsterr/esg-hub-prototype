'use client';

import { SectionCard } from './SectionCard';
import type { ReportPreview as ReportPreviewType } from '../../app/types/report';
import { EditPopup } from './EditPopup';
import { api } from '../../../api';
import { Plane, Truck, Activity } from 'lucide-react';
import { H4 } from '../ui';

interface Props {
  scope3: ReportPreviewType['scope3'];
}

export const Scope3Section = ({ scope3 }: Props) => {
  return (
    <SectionCard
      title="Scope 3 Emissions"
      renderPopup={(close) => (
        <EditPopup
          loadSources={api.getScope3Sources}
          saveSources={api.saveScope3Sources}
          onClose={close}
        />
      )}
    >
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {scope3.categories.map((cat, idx) => (
          <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: idx % 2 === 0 ? '#F5F3FF' : '#EEF2FF' }}>
            <div className="flex items-center justify-between mb-4">
              <H4>{cat.name}</H4>
              {iconFromName(cat.icon ?? '')}
            </div>
            <p className="text-2xl font-medium text-gray-900 mb-2">
              {cat.value.toLocaleString()} tCO2e
            </p>
            {cat.details && (
              <div className="space-y-2 text-sm text-gray-600">
                {cat.details.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{d.label}</span>
                    <span>{d.value.toLocaleString()} tCO2e</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

function iconFromName(name: string) {
  switch (name) {
    case 'plane':
      return <Plane className="text-purple-600 text-xl" />;
    case 'truck':
    case 'ship':
      return <Truck className="text-indigo-600 text-xl" />;
    default:
      return <Activity className="text-primary text-xl" />;
  }
} 