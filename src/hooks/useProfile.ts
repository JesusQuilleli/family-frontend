import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserProfile, changePassword } from '../actions/user-actions';
import { toast } from 'sonner';

export const useProfile = () => {
   const { data: user, isLoading, error } = useQuery({
      queryKey: ['profile'],
      queryFn: getUserProfile,
      staleTime: 1000 * 60 * 60, // 1 hour
   });

   const changePasswordMutation = useMutation({
      mutationFn: changePassword,
      onSuccess: () => {
         toast.success('Contraseña actualizada correctamente');
      },
      onError: (error: any) => {
         toast.error(error.response?.data?.msg || 'Error al actualizar contraseña');
      }
   });

   return {
      user,
      isLoading,
      error,
      changePassword: changePasswordMutation.mutate
   };
};
