import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { Task, Priority } from '../../backend';

export function useListTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.listTasks();
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch tasks');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListFilteredTasks(showCompleted: boolean, tagFilter: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'filtered', showCompleted, tagFilter],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.listFilteredTasks(showCompleted, tagFilter);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch tasks');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      priority,
      dueDate,
      tags,
    }: {
      id: string;
      title: string;
      description: string;
      priority: Priority;
      dueDate: bigint | null;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.createTask(id, title, description, priority, dueDate, tags);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      completed,
      priority,
      dueDate,
      tags,
    }: {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      priority: Priority;
      dueDate: bigint | null;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateTask(id, title, description, completed, priority, dueDate, tags);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteTask(id);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
