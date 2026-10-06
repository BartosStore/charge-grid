import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authSlice from './authSlice';
import uiSlice from './uiSlice';

const STORAGE_KEY = 'chargegrid-state';

const rootReducer = combineSlices(authSlice, uiSlice);
export type RootState = ReturnType<typeof rootReducer>;

function loadState(): Partial<RootState> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<RootState>) : undefined;
  } catch {
    return undefined;
  }
}

export function createStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = createStore(loadState());

store.subscribe(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()));
  } catch {
    // Storage may be unavailable (private mode) – the app works without it.
  }
});

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
