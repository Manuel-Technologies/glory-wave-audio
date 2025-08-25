
import React from 'react';

interface WaveformLogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const WaveformLogo: React.FC<WaveformLogoProps> = ({ 
  size = 'medium', 
  animated = true 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const barHeights = [0.3, 0.7, 1, 0.6, 0.9, 0.4, 0.8, 0.5, 0.95, 0.35, 0.75];

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <div className="flex items-end justify-center gap-1 h-full w-full">
        {barHeights.map((height, index) => (
          <div
            key={index}
            className={`bg-gradient-to-t from-glory-green via-glory-indigo to-glory-amber rounded-full ${
              animated ? 'waveform-animate' : ''
            }`}
            style={{
              width: `${100 / barHeights.length * 0.6}%`,
              height: `${height * 100}%`,
              animationDelay: animated ? `${index * 0.1}s` : '0s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveformLogo;
