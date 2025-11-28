import React from 'react';
import { Participant } from '../types';

interface RaceTrackProps {
  participants: Participant[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ participants }) => {
  // Sort by original index to keep consistent order on screen, 
  // but state updates will animate the width.
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-xl border-4 border-coffee-800 relative overflow-hidden">
      {/* Finish Line */}
      <div className="absolute top-0 bottom-0 right-8 w-2 border-r-2 border-dashed border-coffee-300 z-10 flex flex-col justify-center items-center">
        <span className="bg-coffee-100 text-xs font-bold px-1 text-coffee-400 rotate-90 whitespace-nowrap">FINISH</span>
      </div>

      <div className="space-y-4 relative z-0">
        {participants.map((p) => (
          <div key={p.id} className="relative h-12 flex items-center">
            {/* Lane Background */}
            <div className="absolute inset-0 bg-gray-50 rounded-full border border-gray-100" />
            
            {/* The Runner (Progress Bar) */}
            <div 
              className={`absolute left-0 top-1 bottom-1 rounded-full transition-all duration-100 ease-linear flex items-center justify-end pr-2 shadow-sm ${p.color}`}
              style={{ width: `${Math.max(5, p.progress)}%` }}
            >
              <div className="text-white font-bold text-sm whitespace-nowrap overflow-hidden px-2">
                {p.name}
              </div>
              {/* Coffee Icon Runner */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl filter drop-shadow-md transform transition-transform">
                {p.finished ? '🏁' : '☕'}
              </div>
            </div>

            {/* Rank Indicator (if finished) */}
            {p.rank !== null && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-bold text-coffee-800 w-6 text-center">
                #{p.rank}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaceTrack;
