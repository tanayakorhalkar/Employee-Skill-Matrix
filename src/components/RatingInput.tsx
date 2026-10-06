import React, { useState, useEffect } from 'react';
import { Star, Minus, Plus } from 'lucide-react';
import { getProficiencyLabel } from './RatingBadge';

interface RatingInputProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>(value ? value.toString() : '');

  useEffect(() => {
    setInputValue(value ? Number(value.toFixed(1)).toString() : '');
  }, [value]);

  const activeRating = hoverRating !== null ? hoverRating : (value || 0);
  const proficiencyLabel = getProficiencyLabel(activeRating);

  const getStarColorClass = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-500 fill-emerald-500';
    if (rating >= 3.5) return 'text-indigo-600 fill-indigo-600';
    if (rating >= 2.5) return 'text-blue-600 fill-blue-600';
    if (rating >= 1.5) return 'text-sky-500 fill-sky-500';
    return 'text-amber-500 fill-amber-500';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setInputValue(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 5.0) {
      onChange(Math.round(parsed * 10) / 10);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0.5) {
      onChange(1);
      setInputValue('1');
    } else if (parsed > 5) {
      onChange(5);
      setInputValue('5');
    } else {
      const rounded = Math.round(parsed * 10) / 10;
      onChange(rounded);
      setInputValue(rounded.toString());
    }
  };

  const handleStep = (delta: number) => {
    if (disabled) return;
    const current = value || 3;
    const next = Math.min(5, Math.max(0.5, Math.round((current + delta) * 10) / 10));
    onChange(next);
  };

  const quickPresets = [1.0, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  return (
    <div className="space-y-3 select-none">
      {/* Top Row: Interactive Stars + Numeric Decimal Input */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Star Rating Bar with Half-Star Precision */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            // Calculate percentage of fill for this star (0 to 100%)
            let fillPercent = 0;
            if (activeRating >= starIndex) {
              fillPercent = 100;
            } else if (activeRating > starIndex - 1) {
              fillPercent = Math.round((activeRating - (starIndex - 1)) * 100);
            }

            return (
              <div
                key={starIndex}
                className="relative w-8 h-8 flex items-center justify-center cursor-pointer group"
                onMouseLeave={() => !disabled && setHoverRating(null)}
              >
                {/* Background Empty Star */}
                <Star className="w-7 h-7 text-slate-200 fill-slate-100 transition-colors" />

                {/* Foreground Filled Star Layer with Exact Width Clipping */}
                <div
                  className="absolute inset-0 flex items-center justify-start overflow-hidden pointer-events-none transition-all duration-75"
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star className={`w-7 h-7 shrink-0 ${getStarColorClass(activeRating)}`} />
                </div>

                {/* Clickable/Hoverable Left Half (e.g. 3.5) */}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Rate ${starIndex - 0.5} stars`}
                  onClick={() => onChange(starIndex - 0.5)}
                  onMouseEnter={() => !disabled && setHoverRating(starIndex - 0.5)}
                  className="absolute left-0 top-0 w-1/2 h-full z-10 focus:outline-none"
                />

                {/* Clickable/Hoverable Right Half (e.g. 4.0) */}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Rate ${starIndex} stars`}
                  onClick={() => onChange(starIndex)}
                  onMouseEnter={() => !disabled && setHoverRating(starIndex)}
                  className="absolute right-0 top-0 w-1/2 h-full z-10 focus:outline-none"
                />
              </div>
            );
          })}
        </div>

        {/* Decimal Numeric Input & Steppers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || value <= 0.5}
            onClick={() => handleStep(-0.5)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-bold"
            title="Decrease by 0.5"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs focus-within:ring-2 focus-within:ring-[#1769AA] focus-within:border-transparent">
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="5.0"
              disabled={disabled}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="3.5"
              className="w-11 text-sm font-bold text-slate-800 text-center outline-none bg-transparent"
              aria-label="Rating score out of 5"
            />
            <span className="text-xs font-semibold text-slate-400 select-none">/ 5.0</span>
          </div>

          <button
            type="button"
            disabled={disabled || value >= 5.0}
            onClick={() => handleStep(0.5)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-bold"
            title="Increase by 0.5"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Decimal Range Slider for Tactile Smooth Tuning */}
      <div className="pt-1">
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          disabled={disabled}
          value={activeRating || 3}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1769AA]"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5 mt-1">
          <span>1.0 (Beginner)</span>
          <span>2.0</span>
          <span>3.0 (Intermediate)</span>
          <span>4.0</span>
          <span>5.0 (Expert)</span>
        </div>
      </div>

      {/* Quick Decimal Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Select:</span>
        {quickPresets.map((preset) => {
          const isSelected = Math.abs(value - preset) < 0.05;
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset)}
              className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1769AA] text-white shadow-xs scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {preset % 1 === 0 ? preset.toFixed(1) : preset}
            </button>
          );
        })}
      </div>

      {/* Real-time Proficiency Feedback Banner */}
      <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0B3A5B]">
            ★ {activeRating > 0 ? (activeRating % 1 === 0 ? activeRating.toFixed(1) : activeRating) : '0.0'} / 5.0
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">{proficiencyLabel} Level</span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {activeRating >= 4.5 && 'Subject matter authority & architecture leader'}
          {activeRating >= 3.5 && activeRating < 4.5 && 'Advanced troubleshooting & independent delivery'}
          {activeRating >= 2.5 && activeRating < 3.5 && 'Competent core delivery on standard tasks'}
          {activeRating >= 1.5 && activeRating < 2.5 && 'Guided task execution & growing experience'}
          {activeRating < 1.5 && 'Foundational & theoretical familiarity'}
        </span>
      </div>
    </div>
  );
};
