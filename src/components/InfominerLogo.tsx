import React from 'react';
import LogoImg from '../image/Logo.png';

interface InfominerLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const InfominerLogo: React.FC<InfominerLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="infominer-logo-brand">
      <img 
        src={LogoImg} 
        alt="Infominer Logo" 
        className={`${iconSizes[size]} w-auto object-contain drop-shadow-sm rounded-md bg-white p-1`}
      />
    </div>
  );
};
