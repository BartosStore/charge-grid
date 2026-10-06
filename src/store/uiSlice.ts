import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Language = 'cs' | 'en';

export interface UiState {
  language: Language;
}

const initialState: UiState = { language: 'cs' };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    languageChanged: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
  selectors: {
    selectLanguage: (state) => state.language,
  },
});

export const { languageChanged } = uiSlice.actions;
export const { selectLanguage } = uiSlice.selectors;
export default uiSlice;
