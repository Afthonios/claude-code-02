'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface DurationSliderProps {
  value: number; // in minutes, 0 means no filter
  onChange: (value: number) => void;
  className?: string;
}

export default function DurationSlider({ value, onChange, className = '' }: DurationSliderProps) {
  const t = useTranslations('courses');
  const [isDragging, setIsDragging] = useState(false);

  // Convert minutes to hours for display
  const formatDuration = useCallback((minutes: number): string => {
    if (minutes === 0) return t('filters.duration.any', 'Any duration');
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 120) return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
    return `${Math.floor(minutes / 60)}h`;
  }, [t]);

  // Slider ranges: 0 (no filter), 30min, 1h, 2h, 4h, 8h+
  const sliderSteps = [0, 30, 60, 120, 240, 480];
  const maxStep = sliderSteps.length - 1;

  // Convert value to step index
  const valueToStep = useCallback((minutes: number): number => {
    if (minutes === 0) return 0;
    for (let i = 1; i < sliderSteps.length; i++) {
      if (minutes <= sliderSteps[i]) return i;
    }
    return maxStep;
  }, [maxStep]);

  // Convert step index to value
  const stepToValue = useCallback((step: number): number => {
    return sliderSteps[step] || 0;
  }, []);

  const currentStep = valueToStep(value);

  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(event.target.value, 10);
    const newValue = stepToValue(step);
    onChange(newValue);
  }, [onChange, stepToValue]);

  const handleClear = useCallback(() => {
    onChange(0);
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('filters.maxDuration', 'Maximum Duration')}
        </label>
        {value > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('filters.clearDuration', 'Clear')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Current value display */}
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-1">
          {formatDuration(value)}
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={maxStep}
            step={1}
            value={currentStep}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={`
              w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
              slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:bg-blue-600 
              slider-thumb:rounded-full slider-thumb:cursor-pointer slider-thumb:shadow-md
              slider-thumb:transition-all slider-thumb:duration-150
              ${isDragging ? 'slider-thumb:scale-110' : 'hover:slider-thumb:scale-105'}
            `}
            style={{
              background: value > 0 
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentStep / maxStep) * 100}%, #e5e7eb ${(currentStep / maxStep) * 100}%, #e5e7eb 100%)`
                : ''
            }}
          />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-1 px-1">
            {sliderSteps.map((minutes, index) => (
              <div
                key={index}
                className={`text-xs text-center transition-colors duration-150 ${
                  index <= currentStep 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}
                style={{ width: '1rem' }}
              >
                {index === 0 ? '∞' : formatDuration(minutes).replace(' ', '')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 1rem;
          height: 1rem;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.05);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-webkit-slider-track {
          height: 0.5rem;
          background: #e5e7eb;
          border-radius: 0.5rem;
        }
        
        input[type="range"]::-moz-range-track {
          height: 0.5rem;
          background: #e5e7eb;
          border-radius: 0.5rem;
          border: none;
        }
      `}</style>
    </div>
  );
}