'use client';

import { H4 } from '../ui';

interface Props {
  /** Category name */
  name: string;
  /** Value in tCO2e */
  value: number;
  /** Index used to pick color combination */
  idx?: number;
}

const colorPairs = [
  'bg-red-50 text-red-600',
  'bg-orange-50 text-orange-600',
  'bg-yellow-50 text-yellow-600',
  'bg-green-50 text-green-600',
  'bg-blue-50 text-blue-600',
  'bg-purple-50 text-purple-600',
  'bg-indigo-50 text-indigo-600'
];

export const CategoryCard = ({ name, value, idx = 0 }: Props) => {
  const classes = colorPairs[idx % colorPairs.length].split(' ');
  const bgClass = classes[0];
  const textClass = classes[1];

  return (
    <div className={`${bgClass} p-6 rounded-lg text-center`}>
      <H4 className="mb-2">{name}</H4>
      <p className={`text-2xl font-medium ${textClass}`}>{value.toLocaleString()} tCO2e</p>
    </div>
  );
}; 