import React from 'react';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const getProficiencyLabel = (rating: number): string => {
  if (rating <= 0) return 'Unrated';
  if (rating < 1.8) return 'Beginner';
  if (rating < 2.8) return 'Basic';
  if (rating < 3.8) return 'Intermediate';
  if (rating < 4.8) return 'Advanced';
  return 'Expert';
};

export const getRatingColors = (rating: number) => {
  if (rating >= 4.5) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-400',
      fill: '#20A36A',
    };
  }
  if (rating >= 3.5) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-400',
      fill: '#4338ca',
    };
  }
  if (rating >= 2.5) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      fill: '#1769AA',
    };
  }
  if (rating >= 1.5) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-300',
      fill: '#0284c7',
    };
  }
  if (rating >= 0.5) {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      fill: '#94a3b8',
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    fill: '#cbd5e1',
  };
};

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = 'md',
  showLabel = true,
}) => {
  const colors = getRatingColors(rating);
  const label = getProficiencyLabel(rating);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
      title={`Rating: ${rating}/5 (${label})`}
    >
      <span className="flex items-center">
        {rating > 0 ? (
          <span className="font-bold">{rating % 1 === 0 ? rating : rating.toFixed(1)}</span>
        ) : (
          <span>-</span>
        )}
        <span className="text-[10px] opacity-60 ml-0.5">/5</span>
      </span>
      {showLabel && rating > 0 && (
        <span className="opacity-90">• {label}</span>
      )}
    </span>
  );
};
