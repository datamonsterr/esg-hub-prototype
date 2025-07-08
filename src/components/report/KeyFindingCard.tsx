'use client';

interface Props {
  label: string;
  value: string;
  /** 0-100 */
  progress: number;
  /** Tailwind class e.g. bg-primary */
  color?: string;
  /** Extra class for value text */
  valueClass?: string;
}

export const KeyFindingCard = ({ label, value, progress, color = 'bg-primary', valueClass }: Props) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-medium ${valueClass ?? 'text-gray-900'}`}>{value}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${progress}%` }} />
    </div>
  </div>
); 