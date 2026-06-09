import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workouts, categories, comments } from '../services/api';

export const useWorkouts = (params = {}) => {
  return useQuery({
    queryKey: ['workouts', params],
    queryFn: () => workouts.getAll(params).then(res => res.data),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categories.getAll().then(res => res.data),
  });
};

export const useWorkoutDetail = (id) => {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => workouts.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useComments = (workoutId) => {
  return useQuery({
    queryKey: ['comments', workoutId],
    queryFn: () => comments.getByWorkout(workoutId).then(res => {
      const data = res.data?.results || res.data || [];
      console.log('Comments loaded:', data.length);
      return data;
    }),
    enabled: !!workoutId,
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => workouts.getFavorites().then(res => res.data),
  });
};

export const useIsFavorited = (workoutId) => {
  return useQuery({
    queryKey: ['isFavorited', workoutId],
    queryFn: () => workouts.isFavorited(workoutId).then(res => res.data),
    enabled: !!workoutId,
  });
};

export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workoutId) => workouts.favorite(workoutId),
    onSuccess: (data, workoutId) => {
      queryClient.invalidateQueries({ queryKey: ['isFavorited', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};