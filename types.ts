export interface Participant {
  id: string;
  name: string;
  color: string;
  progress: number; // 0 to 100
  finished: boolean;
  rank: number | null; // 1st, 2nd, etc.
}

export enum GameState {
  IDLE = 'IDLE',
  RACING = 'RACING',
  FINISHED = 'FINISHED',
}

export interface GameResult {
  loser: Participant;
  excuse: string;
}
