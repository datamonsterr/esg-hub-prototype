'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Sector
} from 'recharts';
import { H4 } from '../ui';
import { SectionCard } from './SectionCard';
import { KeyFindingCard } from './KeyFindingCard';
import type { ReportPreview as ReportPreviewType } from '../../app/types/report';
import { EditPopup } from './EditPopup';
import { api } from '../../../api';
import { useState } from 'react';

interface Props {
  summary: ReportPreviewType['summary'];
  emissionsBreakdown: ReportPreviewType['emissionsBreakdown'];
}

const COLORS = ['#DF3F40', '#FFB823', '#328E6E'];

export const ExecutiveSummarySection = ({ summary, emissionsBreakdown }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleLeave = () => setActiveIndex(null);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  return (
    <SectionCard
      title="Executive Summary"
      renderPopup={(close) => (
        <EditPopup
          loadSources={api.getSummarySources}
          saveSources={api.saveSummarySources}
          onClose={close}
        />
      )}
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Key Findings */}
        <div>
          <H4 className="mb-4">Key Findings</H4>
          <div className="space-y-4">
            <KeyFindingCard
              label="Total CO2 Emissions"
              value={`${summary.totalEmissions} ${summary.totalEmissionsUnit}`}
              progress={68}
              color="bg-primary"
            />
            <KeyFindingCard
              label="YoY Change"
              value={`${summary.yoyChange}%`}
              progress={45}
              color="bg-green-500"
              valueClass="text-green-600"
            />
          </div>
        </div>

        {/* Pie Chart */}
        <div>
          <H4 className="mb-4">Emissions Breakdown</H4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={emissionsBreakdown}
                  dataKey="percent"
                  nameKey="scope"
                  outerRadius={100}
                  innerRadius={0}
                  activeShape={renderActiveShape}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={handleEnter}
                  onMouseLeave={handleLeave}
                  label
                >
                  {emissionsBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 