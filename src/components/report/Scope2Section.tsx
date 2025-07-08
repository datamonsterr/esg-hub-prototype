'use client';

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  LabelList
} from 'recharts';

import { SectionCard } from './SectionCard';
import { CategoryCard } from './CategoryCard';
import type { ReportPreview as ReportPreviewType } from '../../app/types/report';
import { EditPopup } from './EditPopup';
import { api } from '../../../api';
import { H4 } from '../ui';

interface Props {
  scope2: ReportPreviewType['scope2'];
  months: string[];
}

export const Scope2Section = ({ scope2, months }: Props) => {
  const monthlyData = months.map((month, idx) => ({
    month,
    grid: scope2.monthlyGrid[idx]
  }));

  return (
    <SectionCard
      title="Scope 2 Emissions"
      renderPopup={(close) => (
        <EditPopup
          loadSources={api.getScope2Sources}
          saveSources={api.saveScope2Sources}
          onClose={close}
        />
      )}
    >
      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {scope2.categories.map((cat, idx) => (
          <CategoryCard key={idx} name={cat.name} value={cat.value} idx={idx + 3} />
        ))}
      </div>

      {/* Chart */}
      <H4 className="mb-4 text-sm font-bold text-center">Monthly Scope 2 Emissions</H4>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="grid" stroke="#328E6E" name="Grid Electricity" dot={{ r: 4 }}>
              <LabelList dataKey="grid" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}; 