import { useQuery } from '@tanstack/react-query';
import { getUserById } from '../actions/user-actions';

export const useAdminUser = (id: string) => {
   const { data, isLoading, error } = useQuery({
      queryKey: ['user', id],
      queryFn: () => getUserById(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
   });

   return {
      user: data?.user,
      isLoading,
      error
   };
};
