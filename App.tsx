import React, { useState, useRef, useEffect, useCallback } from 'react';
import ParticipantInput from './components/ParticipantInput';
import RaceTrack from './components/RaceTrack';
import ResultCard from './components/ResultCard';
import { Participant, GameState } from './types';
import { GAME_DURATION_MS, UPDATE_INTERVAL_MS } from './constants';
import { generateLoserExcuse } from './services/geminiService';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [loserExcuse, setLoserExcuse] = useState<string | null>(null);
  
  // Refs for game loop
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Audio context for sound effects (simple oscillators)
  const playSound = (type: 'tick' | 'finish') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'tick') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        // Lose sound (sad trombone-ish)
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      // Ignore audio errors
    }
  };

  const startGame = useCallback(() => {
    if (participants.length < 2) return;

    setGameState(GameState.RACING);
    setLoserExcuse(null);
    startTimeRef.current = Date.now();
    
    // Reset progress
    setParticipants(prev => prev.map(p => ({ ...p, progress: 0, finished: false, rank: null })));

    // Assign random "speeds" or target durations to each participant
    // To ensure the game finishes within ~4 seconds, but creates tension
    const speeds = participants.map(() => 0.5 + Math.random() * 0.5); // base multiplier

    let finishedCount = 0;
    
    // Game Loop
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = elapsed / GAME_DURATION_MS;

      setParticipants(prev => {
        let anyoneFinishedThisTick = false;
        
        const nextState = prev.map((p, idx) => {
          if (p.finished) return p;

          // Add some noise/randomness to the movement so it's not linear
          const noise = (Math.random() - 0.5) * 2; 
          let newProgress = p.progress + (speeds[idx] * (100 / (GAME_DURATION_MS / UPDATE_INTERVAL_MS))) + noise;

          // Clamp
          if (newProgress >= 100) {
            newProgress = 100;
            // Determine rank (reverse logic for paying? No, usually loser is last)
            // Let's say: The LAST person to cross the line pays.
            // So we just track ranks as they finish.
          }

          return { ...p, progress: newProgress };
        });

        // Check for finishers
        // We need to determine who finished *this tick* to assign rank
        const finishedThisTickIndices: number[] = [];
        nextState.forEach((p, idx) => {
          if (!prev[idx].finished && p.progress >= 100) {
            finishedThisTickIndices.push(idx);
          }
        });

        if (finishedThisTickIndices.length > 0) {
           anyoneFinishedThisTick = true;
           finishedThisTickIndices.forEach(idx => {
             finishedCount++;
             nextState[idx].finished = true;
             nextState[idx].rank = finishedCount;
           });
        }
        
        // Check if everyone finished
        const allFinished = nextState.every(p => p.finished);
        
        if (allFinished) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleGameFinish(nextState);
        } else if (anyoneFinishedThisTick) {
          playSound('tick');
        }

        return nextState;
      });

    }, UPDATE_INTERVAL_MS);
  }, [participants]);

  const handleGameFinish = async (finalParticipants: Participant[]) => {
    // Determine loser (The person with the highest rank number = Last place)
    // Actually, rank 1 finished first. So if 5 people, rank 5 is loser.
    
    const loser = finalParticipants.reduce((prev, current) => {
      return (prev.rank || 0) > (current.rank || 0) ? prev : current;
    });

    setGameState(GameState.FINISHED);
    playSound('finish');

    // Fetch AI excuse
    const allNames = finalParticipants.map(p => p.name);
    const reason = await generateLoserExcuse(loser.name, allNames);
    setLoserExcuse(reason);
  };

  const resetGame = () => {
    setGameState(GameState.IDLE);
    setParticipants(prev => prev.map(p => ({ ...p, progress: 0, finished: false, rank: null })));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Determine which view to show
  const getLoser = () => {
    if (gameState !== GameState.FINISHED) return null;
    return participants.reduce((prev, current) => (prev.rank || 0) > (current.rank || 0) ? prev : current);
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-fredoka font-bold text-coffee-800 tracking-tight drop-shadow-sm">
          Coffee Dash ☕️
        </h1>
        <p className="text-coffee-600 mt-2 font-nunito font-semibold">
          Last one to finish pays the bill!
        </p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        
        {/* Input Phase */}
        {gameState === GameState.IDLE && (
          <ParticipantInput 
            participants={participants} 
            setParticipants={setParticipants} 
            onStart={startGame}
            disabled={false}
          />
        )}

        {/* Racing Phase */}
        {(gameState === GameState.RACING || gameState === GameState.FINISHED) && (
          <div className="w-full space-y-6 animate-fade-in">
             {gameState === GameState.RACING && (
               <div className="text-center animate-pulse text-coffee-600 font-bold text-xl mb-4">
                 Racing for your wallet...
               </div>
             )}
            <RaceTrack participants={participants} />
          </div>
        )}

        {/* Result Phase */}
        {gameState === GameState.FINISHED && getLoser() && (
          <ResultCard 
            loser={getLoser()!} 
            excuse={loserExcuse}
            onReset={resetGame}
          />
        )}
      </main>

      <footer className="mt-auto py-6 text-coffee-400 text-sm font-nunito text-center">
        Powered by React & Gemini AI • Keep your receipt!
      </footer>
    </div>
  );
};

export default App;
