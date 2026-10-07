import React from 'react';

interface EmployeeAvatarProps {
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  className: string;
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  firstName,
  lastName,
  profilePicture,
  className,
}) => (
  <div
    className={`overflow-hidden rounded-full ${profilePicture ? 'bg-slate-100' : 'bg-[#1769AA] text-white'} ${className}`}
    aria-label={`${firstName} ${lastName} profile picture`}
  >
    {profilePicture ? (
      <img
        src={profilePicture}
        alt={`${firstName} ${lastName}`}
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="w-full h-full flex items-center justify-center font-bold uppercase">
        {firstName[0] || '?'}{lastName[0] || ''}
      </span>
    )}
  </div>
);
