import React from 'react';
import { Flame } from 'lucide-react';

interface HeatIndicatorProps {
  level: number; // 0 to 4
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const HEAT_DESCRIPTIONS = [
  'Zero Heat (Sweet & Floral)',
  'Mild Warmth (Gentle Tingling)',
  'Medium Heat (Assertive Bite)',
  'Hot (Spicy & Lingering)',
  'Fiery Volcano (Extreme Heat)',
];

export function HeatIndicator({ level, showLabel = true, size = 'sm' }: HeatIndicatorProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="inline-flex items-center gap-1.5" title={`Heat Level: ${level}/4 - ${HEAT_DESCRIPTIONS[level] || ''}`}>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3].map((index) => {
          const isActive = level > index;
          return (
            <Flame
              key={index}
              className={`${iconSize} transition-colors ${
                isActive
                  ? index === 0
                    ? 'text-amber-500 fill-amber-500'
                    : index === 1
                    ? 'text-orange-500 fill-orange-500'
                    : index === 2
                    ? 'text-red-500 fill-red-500'
                    : 'text-purple-600 fill-purple-600 animate-pulse'
                  : 'text-stone-300 dark:text-stone-700'
              }`}
            />
          );
        })}
      </div>
      {showLabel && (
        <span className={`font-medium ${
          level === 0 ? 'text-stone-500' :
          level === 1 ? 'text-amber-700' :
          level === 2 ? 'text-orange-700' :
          level === 3 ? 'text-red-700 font-semibold' :
          'text-purple-700 font-bold'
        } ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {level === 0 ? 'Aromatic' : level === 1 ? 'Mild' : level === 2 ? 'Medium' : level === 3 ? 'Hot' : 'Fiery'}
        </span>
      )}
    </div>
  );
}
