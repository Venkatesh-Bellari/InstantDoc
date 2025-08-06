
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. 'text-primary'
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'text-primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-solid border-t-transparent ${sizeClasses[size]} ${color}`}
        style={{ borderTopColor: 'transparent' }} // Ensure border-t-transparent is applied
      ></div>
    </div>
  );
};

export default Spinner;
