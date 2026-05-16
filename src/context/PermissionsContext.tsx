import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken } from '../api/apiClient';
import { permissionsApi } from '../api/services';
import type { DevelopmentAccessMode, EffectivePermissions } from '../types';

interface PermissionsContextValue {
  loading: boolean;
  noAssignments: boolean;
  permissions: Record<string, string[]>;
  developmentAccessMode: DevelopmentAccessMode;
  allowedDevelopmentIds: string[];
  hasPermission: (module: string, action: string) => boolean;
  canAccessDevelopment: (id: string) => boolean;
  reload: () => void;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  loading: false,
  noAssignments: true,
  permissions: {},
  developmentAccessMode: 'all',
  allowedDevelopmentIds: [],
  hasPermission: () => true,
  canAccessDevelopment: () => true,
  reload: () => undefined,
});

export function PermissionsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EffectivePermissions>({
    noAssignments: true,
    permissions: {},
    developmentAccessMode: 'all',
    allowedDevelopmentIds: [],
  });

  const fetchPermissions = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await permissionsApi.myPermissions();
      setData(res.permissions);
    } catch {
      // Si falla (sin token, sesión expirada, etc.) → backward compat: mostrar todo
      setData({ noAssignments: true, permissions: {}, developmentAccessMode: 'all', allowedDevelopmentIds: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPermissions(); }, [fetchPermissions]);

  function hasPermission(module: string, action: string): boolean {
    if (data.noAssignments) return true;
    return (data.permissions[module] || []).includes(action);
  }

  function canAccessDevelopment(id: string): boolean {
    if (data.noAssignments) return true;
    if (data.developmentAccessMode === 'all') return true;
    return data.allowedDevelopmentIds.includes(id);
  }

  return (
    <PermissionsContext.Provider value={{
      loading,
      noAssignments: data.noAssignments,
      permissions: data.permissions,
      developmentAccessMode: data.developmentAccessMode,
      allowedDevelopmentIds: data.allowedDevelopmentIds,
      hasPermission,
      canAccessDevelopment,
      reload: fetchPermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  return useContext(PermissionsContext);
}
