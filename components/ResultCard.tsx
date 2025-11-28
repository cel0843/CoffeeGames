import React from 'react';
import { Participant } from '../types';

interface ResultCardProps {
  loser: Participant;
  excuse: string | null;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ loser, excuse, onReset }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-coffee-600">
        <div className="bg-coffee-600 p-4 text-center">
          <h2 className="text-white font-fredoka text-xl opacity-90">And the bill goes to...</h2>
        </div>
        
        <div className="p-8 text-center flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full ${loser.color} flex items-center justify-center text-4xl shadow-inner mb-6 animate-bounce`}>
            💸
          </div>
          
          <h1 className="text-4xl font-black text-coffee-900 mb-2 font-fredoka">
            {loser.name}
          </h1>
          
          <div className="w-full h-px bg-coffee-200 my-4" />
          
          <div className="min-h-[80px] flex items-center justify-center">
             {excuse ? (
              <p className="text-lg text-coffee-700 italic font-nunito leading-relaxed">
                "{excuse}"
              </p>
            ) : (
              <div className="flex gap-2 justify-center">
                <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-coffee-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          <button
            onClick={onReset}
            className="mt-8 px-8 py-3 bg-coffee-100 text-coffee-800 font-bold rounded-full hover:bg-coffee-200 transition-colors border-2 border-coffee-300"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
