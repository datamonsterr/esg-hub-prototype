'use client';

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LabelList
} from 'recharts';

import { SectionCard } from './SectionCard';
import { CategoryCard } from './CategoryCard';
import type { ReportPreview as ReportPreviewType } from '../../app/types/report';
import { EditPopup } from './EditPopup';
import { api } from '../../../api';
import { H4 } from '../ui';

interface Props {
  scope1: ReportPreviewType['scope1'];
}

export const Scope1Section = ({ scope1 }: Props) => {
  const monthlyData = scope1.monthly.months.map((month, idx) => ({
    month,
    fuelCombustion: scope1.monthly.fuelCombustion[idx],
    fleetVehicles: scope1.monthly.fleetVehicles[idx],
    processEmissions: scope1.monthly.processEmissions[idx]
  }));

  return (
    <SectionCard
      title="Scope 1 Emissions"
      renderPopup={(close) => (
        <EditPopup
          loadSources={api.getScope1Sources}
          saveSources={api.saveScope1Sources}
          onClose={close}
        />
      )}
    >
      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {scope1.categories.map((cat, idx) => (
          <CategoryCard key={idx} name={cat.name} value={cat.value} idx={idx} />
        ))}
      </div>

      {/* Chart */}
      <H4 className="mb-4 text-sm font-bold text-center">Monthly Scope 1 Emissions</H4>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={monthlyData} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Grouped bars with custom size and labels */}
            <Bar dataKey="fuelCombustion" fill="#DF3F40" name="Fuel Combustion" barSize={10}>
              <LabelList dataKey="fuelCombustion" position="top" />
            </Bar>
            <Bar dataKey="fleetVehicles" fill="#FFB823" name="Fleet Vehicles" barSize={10}>
              <LabelList dataKey="fleetVehicles" position="top" />
            </Bar>
            <Bar dataKey="processEmissions" fill="#FF6B35" name="Process Emissions" barSize={10}>
              <LabelList dataKey="processEmissions" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}; 