import React, { useState } from 'react';
import { Star } from 'lucide-react';
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

  const activeRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              data-rating={star}
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              className={`p-1.5 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? star === 5
                      ? 'fill-emerald-500 text-emerald-500'
                      : star >= 3
                      ? 'fill-blue-600 text-blue-600'
                      : 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-sm font-semibold text-slate-700">
          {activeRating > 0 ? `${activeRating} / 5` : 'Select Rating'}
        </span>
      </div>
      <div className="text-xs text-slate-500 font-medium h-4">
        {activeRating > 0 ? (
          <span className="text-blue-700">
            Level {activeRating}: <span className="font-semibold">{getProficiencyLabel(activeRating)}</span>
            {activeRating === 1 && ' — Basic theoretical familiarity'}
            {activeRating === 2 && ' — Can execute guided tasks'}
            {activeRating === 3 && ' — Competent independent execution'}
            {activeRating === 4 && ' — Advanced troubleshooting and optimization'}
            {activeRating === 5 && ' — Subject matter expert & authority'}
          </span>
        ) : (
          <span>Click a star from 1 (Beginner) to 5 (Expert)</span>
        )}
      </div>
    </div>
  );
};
