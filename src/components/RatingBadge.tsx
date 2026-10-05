import React from 'react';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const getProficiencyLabel = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Basic';
    case 3:
      return 'Intermediate';
    case 4:
      return 'Advanced';
    case 5:
      return 'Expert';
    default:
      return 'Unrated';
  }
};

export const getRatingColors = (rating: number) => {
  switch (rating) {
    case 1:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        fill: '#94a3b8',
      };
    case 2:
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-300',
        fill: '#0284c7',
      };
    case 3:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        fill: '#1769AA',
      };
    case 4:
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-900',
        border: 'border-indigo-400',
        fill: '#4338ca',
      };
    case 5:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-400',
        fill: '#20A36A',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        border: 'border-gray-200',
        fill: '#cbd5e1',
      };
  }
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
          <span className="font-bold">{rating}</span>
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
