import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginResponse, Role, User } from '../api/types';

export interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn: (_state, action: PayloadAction<LoginResponse>) => ({ token: action.payload.token, user: action.payload.user }),
    userRefreshed: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    loggedOut: () => initialState,
  },
  selectors: {
    selectToken: (state) => state.token,
    selectUser: (state) => state.user,
  },
});

export const { loggedIn, loggedOut, userRefreshed } = authSlice.actions;
export const { selectToken, selectUser } = authSlice.selectors;
export default authSlice;

const ROLE_RANK: Record<Role, number> = { viewer: 0, operator: 1, admin: 2 };
export const hasRole = (user: User | null, role: Role) => !!user && ROLE_RANK[user.role] >= ROLE_RANK[role];
