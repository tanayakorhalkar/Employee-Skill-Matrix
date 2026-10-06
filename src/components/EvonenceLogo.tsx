import React from 'react';
import logoWebp from '../assets/evonence-logo.webp';
import logoWhiteWebp from '../assets/evonence-logo-white.webp';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const EvonenceLogo: React.FC<LogoProps> = ({
  variant = 'light',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-[170px]',
    md: 'max-w-[220px]',
    lg: 'max-w-[320px]',
    xl: 'max-w-[420px]',
  }[size];

  const currentSrc = variant === 'dark' ? logoWhiteWebp : logoWebp;
  const fallbackSrc = variant === 'dark' ? '/logo/evonence-logo-white.webp' : '/logo/evonence-logo.webp';

  return (
    <div className={`inline-flex items-center select-none ${sizeClasses} ${className}`}>
      <img
        src={currentSrc}
        alt="Evonence - Simplify Cloud Adoption"
        className="w-full h-auto object-contain drop-shadow-sm transition-transform duration-200"
        loading="eager"
        onError={(e) => {
          if (e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />
    </div>
  );
};
