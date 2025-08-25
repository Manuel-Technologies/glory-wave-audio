
import React from 'react';

interface AudioLevelMeterProps {
  level: number; // 0-100
}

const AudioLevelMeter: React.FC<AudioLevelMeterProps> = ({ level }) => {
  const getBarColor = (barIndex: number, level: number) => {
    const barLevel = (barIndex + 1) * 10; // Each bar represents 10% of range
    
    if (level < barLevel) return 'bg-surface-elevated';
    
    if (barLevel <= 60) return 'bg-glory-green';
    if (barLevel <= 80) return 'bg-glory-amber';
    return 'bg-glory-red';
  };

  const bars = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-24 gap-1">
        {bars.map((barIndex) => (
          <div
            key={barIndex}
            className={`flex-1 rounded-sm transition-colors duration-75 ${getBarColor(barIndex, level)}`}
            style={{
              height: `${Math.min((barIndex + 1) * 10, 100)}%`,
            }}
          />
        ))}
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>0</span>
        <span className="text-glory-green">60</span>
        <span className="text-glory-amber">80</span>
        <span className="text-glory-red">100</span>
      </div>
    </div>
  );
};

export default AudioLevelMeter;
