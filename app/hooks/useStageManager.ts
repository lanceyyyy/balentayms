'use client';

import { useReducer, useCallback } from 'react';
import type { Stage } from '../types';

interface StageState {
  currentStage: Stage;
  transitionState: 'idle' | 'exiting' | 'entering';
}

type StageAction =
  | { type: 'BEGIN_EXIT' }
  | { type: 'ADVANCE' }
  | { type: 'ENTER_COMPLETE' };

const stageOrder: Stage[] = ['draw-heart', 'timeline', 'write-with-me', 'build-moment', 'the-question'];

function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case 'BEGIN_EXIT':
      return { ...state, transitionState: 'exiting' };
    case 'ADVANCE': {
      const currentIndex = stageOrder.indexOf(state.currentStage);
      const nextStage = stageOrder[currentIndex + 1] || state.currentStage;
      return { currentStage: nextStage, transitionState: 'entering' };
    }
    case 'ENTER_COMPLETE':
      return { ...state, transitionState: 'idle' };
    default:
      return state;
  }
}

export function useStageManager() {
  const [state, dispatch] = useReducer(stageReducer, {
    currentStage: 'draw-heart',
    transitionState: 'idle',
  });

  const advanceStage = useCallback(() => {
    dispatch({ type: 'BEGIN_EXIT' });
    setTimeout(() => {
      dispatch({ type: 'ADVANCE' });
    }, 100);
  }, []);

  const onEnterComplete = useCallback(() => {
    dispatch({ type: 'ENTER_COMPLETE' });
  }, []);

  return {
    currentStage: state.currentStage,
    transitionState: state.transitionState,
    advanceStage,
    onEnterComplete,
  };
}
