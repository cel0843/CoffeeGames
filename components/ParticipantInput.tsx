
import React, { useState } from 'react';
import { Participant } from '../types';
import { PRESET_COLORS } from '../constants';

interface ParticipantInputProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onStart: () => void;
  disabled: boolean;
}

const ParticipantInput: React.FC<ParticipantInputProps> = ({ 
  participants, 
  setParticipants, 
  onStart,
  disabled
}) => {
  const [newName, setNewName] = useState('');
  const MAX_PARTICIPANTS = 20;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;
    if (participants.length >= MAX_PARTICIPANTS) return;

    // Cycle through colors if we exceed the preset list length
    const colorIndex = participants.length % PRESET_COLORS.length;
    const assignedColor = PRESET_COLORS[colorIndex];
    
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: assignedColor,
      progress: 0,
      finished: false,
      rank: null,
    };

    setParticipants(prev => [...prev, newParticipant]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    if (participants.length > 0 && window.confirm("Remove all participants?")) {
      setParticipants([]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border-2 border-coffee-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-fredoka font-bold text-coffee-800">
          ☕ Who's Drinking?
        </h2>
        <span className="text-sm font-bold text-coffee-600 bg-coffee-100 px-2 py-1 rounded-full">
          {participants.length}/{MAX_PARTICIPANTS}
        </span>
      </div>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter name..."
          disabled={disabled || participants.length >= MAX_PARTICIPANTS}
          className="flex-1 px-4 py-2 border-2 border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-600 bg-white text-black font-bold placeholder-gray-400 font-nunito transition-colors"
          maxLength={15}
        />
        <button
          type="submit"
          disabled={!newName.trim() || disabled || participants.length >= MAX_PARTICIPANTS}
          className="px-4 py-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
        >
          Add
        </button>
      </form>

      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto min-h-[50px]">
        {participants.length === 0 && (
          <p className="text-center text-coffee-400 italic py-2">No caffeine addicts added yet.</p>
        )}
        {participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-coffee-100 px-3 py-2 rounded-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="font-nunito font-bold text-coffee-800">{p.name}</span>
            </div>
            <button
              onClick={() => handleRemove(p.id)}
              disabled={disabled}
              className="text-coffee-400 hover:text-red-500 transition-colors p-1"
              aria-label="Remove participant"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {participants.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="px-4 py-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-bold disabled:opacity-50"
            title="Clear all"
          >
            🗑️
          </button>
        )}
        <button
          onClick={onStart}
          disabled={participants.length < 2 || disabled}
          className="flex-1 py-4 bg-gradient-to-r from-coffee-600 to-coffee-500 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-fredoka font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {participants.length < 2 ? "Add at least 2" : "Start Race! 🏁"}
        </button>
      </div>
    </div>
  );
};

export default ParticipantInput;
