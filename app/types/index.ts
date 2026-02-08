export interface Point {
  x: number;
  y: number;
}

export interface StrokePoint extends Point {
  pressure: number;
  tiltX: number;
  tiltY: number;
  timestamp: number;
  pointerType: string;
}

export interface Stroke {
  points: StrokePoint[];
  startTime: number;
  endTime: number;
}

export interface HeartDetectionResult {
  completionPercentage: number;
  coveredSectors: boolean[];
  isComplete: boolean;
  isValidShape: boolean;
  feedback: 'idle' | 'keep-going' | 'almost' | 'complete';
}

export type Stage = 'draw-heart' | 'timeline' | 'write-with-me' | 'build-moment' | 'the-question';

export type DrawingState = 'idle' | 'drawing' | 'analyzing' | 'complete';
