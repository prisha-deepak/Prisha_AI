import { useCallback, useEffect, useState } from 'react';

const ADMIN_STORAGE_KEY = 'ai-mr-admin-mode';

function readAdminMode(): boolean {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (stored != null) {
    return stored === 'true';
  }
  return import.meta.env.VITE_ADMIN_MODE === 'true';
}

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(readAdminMode);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, String(isAdmin));
  }, [isAdmin]);

  const toggleAdminMode = useCallback(() => {
    setIsAdmin((current) => !current);
  }, []);

  return { isAdmin, toggleAdminMode };
}
