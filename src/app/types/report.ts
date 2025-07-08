export interface Summary {
  totalEmissions: number;
  totalEmissionsUnit: string;
  yoyChange: number; // percentage
}

export interface EmissionBreakdownItem {
  scope: string;
  percent: number;
}

export interface CategoryValue {
  name: string;
  value: number;
}

export interface Scope3Category extends CategoryValue {
  icon?: string;
  details?: { label: string; value: number }[];
}

export interface Scope1Monthly {
  months: string[];
  fuelCombustion: number[];
  fleetVehicles: number[];
  processEmissions: number[];
}

export interface Scope1Data {
  categories: CategoryValue[];
  monthly: Scope1Monthly;
}

export interface Scope2Data {
  categories: CategoryValue[];
  monthlyGrid: number[];
}

export interface Scope3Data {
  categories: Scope3Category[];
}

/**
 * Generic data source item used in popup editing UI
 */
export interface DataSource {
  id: number;
  name: string;
  description: string;
  /** Lucide icon name */
  icon: string;
}

export interface ReductionTarget {
  /** e.g., "50% Reduction" */
  label: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Status label eg "On Track" */
  status: string;
  /** Tailwind colour class e.g. bg-green-100 text-green-700 */
  colorClasses: string;
}

export interface KeyInitiative {
  name: string;
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Tailwind colour class for icon */
  iconColor: string;
}

export interface ReductionPlanData {
  targets: ReductionTarget[];
  initiatives: KeyInitiative[];
}

export interface ReportPreview {
  id: number;
  year: number;
  generated: string; // ISO date string
  summary: Summary;
  emissionsBreakdown: EmissionBreakdownItem[];
  scope1: Scope1Data;
  scope2: Scope2Data;
  scope3: Scope3Data;
  reductionPlan: ReductionPlanData;
} 