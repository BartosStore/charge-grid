import { useQuery } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { apiFetch } from '../../api/client';
import type { User } from '../../api/types';
import { selectToken, userRefreshed } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';

/** Redirects to the login page when nobody is signed in and keeps the user profile fresh. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAppSelector(selectToken);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { data } = useQuery({
    queryKey: ['me', token],
    queryFn: () => apiFetch<User>('/auth/me'),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (data) dispatch(userRefreshed(data));
  }, [data, dispatch]);

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
