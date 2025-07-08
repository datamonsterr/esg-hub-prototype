'use client';

import { useEffect, useState, ReactElement } from 'react';
import { Button, H4 } from '../ui';
import {
  X,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Shuffle,
  Zap,
  Flame,
  Snowflake,
  Truck,
  Factory,
  Plane,
  Ship,
  Leaf,
  Sun,
  Activity,
  TrendingUp
} from 'lucide-react';
import type { DataSource } from '../../app/types/report';
import { api } from '../../../api';

interface Props {
  loadSources: () => Promise<DataSource[]>;
  saveSources: (sources: DataSource[]) => Promise<void>;
  onClose: () => void;
}

export const EditPopup = ({ loadSources, saveSources, onClose }: Props) => {
  const [sources, setSources] = useState<DataSource[]>([]);

  // Load initial mock sources (could come from props or API)
  useEffect(() => {
    loadSources()
      .then(setSources)
      .catch(() => setSources([]));
  }, [loadSources]);

  const handleAdd = async () => {
    try {
      const data: DataSource[] = await api.getAvailableSources();
      if (data.length) setSources((prev) => [...prev, data[0]]);
    } catch (_) {
      // noop
    }
  };

  const handleRegenerate = async () => {
    // For now just reload
    setSources([]);
    handleAdd();
  };

  const handleSave = async () => {
    await saveSources(sources);
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-border rounded-lg shadow-lg z-10">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <H4>Data Sources</H4>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sources list */}
        <div className="space-y-3 mb-4 max-h-60 overflow-auto">
          {sources.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {(iconMap[s.icon] || <Plus className="text-primary" />)}
                <div>
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <p className="text-sm text-gray-600">{s.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-accent hover:text-accent/80">
                  <Shuffle className="w-4 h-4" />
                </button>
                <button className="text-error hover:text-error/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant="outline"
            className="flex-1 text-sm px-3 py-2 border-primary text-primary"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Source
          </Button>
          <Button
            variant="secondary"
            className="flex-1 text-sm px-3 py-2"
            onClick={handleRegenerate}
          >
            <RefreshCcw className="w-4 h-4 mr-1" /> Regenerate
          </Button>
        </div>

        {/* Save */}
        <Button variant="accent" className="w-full text-sm px-3 py-2" onClick={handleSave}>
          <Save className="w-4 h-4 mr-1" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

// Icon map after component to avoid hoisting issues
const iconMap: Record<string, ReactElement> = {
  bolt: <Zap className="text-primary" />,
  zap: <Zap className="text-primary" />,
  fire: <Flame className="text-primary" />,
  flame: <Flame className="text-primary" />,
  snowflake: <Snowflake className="text-primary" />,
  truck: <Truck className="text-primary" />,
  factory: <Factory className="text-primary" />,
  plane: <Plane className="text-primary" />,
  ship: <Ship className="text-primary" />,
  leaf: <Leaf className="text-primary" />,
  sun: <Sun className="text-primary" />,
  activity: <Activity className="text-primary" />,
  'trending-up': <TrendingUp className="text-primary" />
}; 