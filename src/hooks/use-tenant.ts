import { useAuth } from "./use-auth";

/**
 * Returns the current user's tenantId from their authenticated profile.
 * All dashboard pages should use this instead of hardcoded "demo" tenantId.
 */
export function useTenantId(): string | undefined {
  const { user } = useAuth();
  return user?.tenantId;
}
