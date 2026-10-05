import React, { useId } from 'react';

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
  showTagline = true,
}) => {
  const maskId = useId();
  const isDark = variant === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#0B2545';
  const cyanBlue = '#00A0E9';

  const sizeClasses = {
    sm: 'max-w-[190px]',
    md: 'max-w-[220px]',
    lg: 'max-w-[300px]',
    xl: 'max-w-[400px]',
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${sizeClasses} ${className}`}>
      <svg
        viewBox="0 0 980 430"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xs transition-transform duration-200"
      >
        <defs>
          {/* Mask that carves out the fluid wave swirl and secondary arc cutout */}
          <mask id={`cloud-spiral-mask-${maskId}`}>
            {/* Base reveal rectangle */}
            <rect width="980" height="430" fill="#FFFFFF" />

            {/* Negative space wave swirl */}
            <path
              d="M 125 295
                 C 82 295, 48 260, 48 215
                 C 48 160, 92 120, 150 120
                 C 200 120, 232 156, 232 202
                 C 232 242, 200 272, 162 272
                 C 132 272, 110 248, 110 220
                 C 110 196, 126 180, 146 180
                 C 162 180, 172 191, 172 205
                 C 172 216, 162 225, 150 225
                 C 142 225, 136 219, 136 213"
              stroke="#000000"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Secondary accent arc cutout */}
            <path
              d="M 190 238
                 C 210 238, 235 244, 248 256"
              stroke="#000000"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
          </mask>
        </defs>

        {/* Cyan Cloud Glyph with negative-space cutout */}
        <g id="cloud-mark" mask={`url(#cloud-spiral-mask-${maskId})`}>
          <path
            d="M 195 80
               C 232 80, 262 110, 276 142
               C 308 152, 338 182, 338 222
               C 338 262, 308 295, 260 297
               L 135 297
               C 72 297, 26 250, 26 188
               C 26 135, 66 92, 120 85
               C 140 81, 165 80, 195 80 Z"
            fill={cyanBlue}
          />
        </g>

        {/* Wordmark: evonence */}
        <text
          x="385"
          y="235"
          fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', sans-serif"
          fontSize="124"
          fontWeight="700"
          letterSpacing="-1.5"
          fill={textColor}
        >
          evonence
        </text>

        {showTagline && (
          <>
            {/* Horizontal baseline connected under the cloud */}
            <line
              x1="250"
              y1="297"
              x2="960"
              y2="297"
              stroke={cyanBlue}
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Tagline: Simplify Cloud Adoption */}
            <text
              x="390"
              y="365"
              fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', sans-serif"
              fontSize="52"
              fontWeight="600"
              letterSpacing="0.4"
              fill={cyanBlue}
            >
              Simplify Cloud Adoption
            </text>
          </>
        )}
      </svg>
    </div>
  );
};
