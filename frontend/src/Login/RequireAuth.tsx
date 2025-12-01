import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredAuthSession } from './auth';

type RequireAuthProps = {
  children: React.ReactElement;
};

export function RequireAuth({ children }: RequireAuthProps): React.ReactElement {
  const location = useLocation();
  const session = getStoredAuthSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
