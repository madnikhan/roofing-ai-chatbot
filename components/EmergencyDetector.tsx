'use client';

import { detectEmergency, getEmergencyLevel } from '@/lib/ai-responses';
import { useEffect, useState } from 'react';

interface EmergencyDetectorProps {
  message: string;
  onEmergencyDetected: (level: number) => void;
}

export default function EmergencyDetector({ message, onEmergencyDetected }: EmergencyDetectorProps) {
  const [emergencyLevel, setEmergencyLevel] = useState<number>(0);

  useEffect(() => {
    if (message) {
      const isEmergency = detectEmergency(message);
      if (isEmergency) {
        const level = getEmergencyLevel(message);
        setEmergencyLevel(level);
        onEmergencyDetected(level);
      } else {
        setEmergencyLevel(0);
      }
    }
  }, [message, onEmergencyDetected]);

  if (emergencyLevel === 0) return null;

  return (
    <div className="bg-emergency/10 border-l-4 border-emergency p-4 mb-4 rounded-r">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚨</span>
        <div>
          <p className="font-semibold text-emergency">Emergency Detected</p>
          <p className="text-sm text-gray-600">
            {emergencyLevel >= 4 
              ? 'This appears to be a high-priority emergency. We will respond within 2 hours.'
              : 'This appears to be an urgent situation. We will prioritize your request.'}
          </p>
        </div>
      </div>
    </div>
  );
}

