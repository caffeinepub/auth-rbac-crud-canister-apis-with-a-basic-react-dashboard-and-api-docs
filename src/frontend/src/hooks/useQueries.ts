import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole } from '../backend';

export interface UserProfile {
  name: string;
  role: UserRole;
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const role = await actor.getCallerUserRole();
        // For now, we'll use the principal as the name placeholder
        // In a real app, you'd fetch this from a user profile store
        return {
          name: 'User',
          role: role,
        };
      } catch (error: any) {
        // If user doesn't exist yet, return null
        if (error.message?.includes('not found') || error.message?.includes('No profile')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      // In this implementation, the profile is automatically created when the user authenticates
      // This is a placeholder for future profile management
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
