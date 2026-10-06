import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Language = 'cs' | 'en';

export interface UiState {
  railExpanded: boolean;
  language: Language;
  /** Global location filter shared by all data pages; null = all locations. */
  locationId: string | null;
}

const initialState: UiState = { railExpanded: false, language: 'cs', locationId: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    railToggled: (state) => {
      state.railExpanded = !state.railExpanded;
    },
    languageChanged: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    locationChanged: (state, action: PayloadAction<string | null>) => {
      state.locationId = action.payload;
    },
  },
  selectors: {
    selectRailExpanded: (state) => state.railExpanded,
    selectLanguage: (state) => state.language,
    selectLocationId: (state) => state.locationId,
  },
});

export const { railToggled, languageChanged, locationChanged } = uiSlice.actions;
export const { selectRailExpanded, selectLanguage, selectLocationId } = uiSlice.selectors;
export default uiSlice;
