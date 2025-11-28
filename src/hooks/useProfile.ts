import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, changePassword, updateUserProfile } from '../actions/user-actions';
import { toast } from 'sonner';

export const useProfile = () => {
   const queryClient = useQueryClient();

   const { data: user, isLoading, error } = useQuery({
      queryKey: ['profile'],
      queryFn: getUserProfile,
      staleTime: 1000 * 60 * 60, // 1 hour
   });

   const updateProfileMutation = useMutation({
      mutationFn: updateUserProfile,
      onSuccess: () => {
         toast.success('Perfil actualizado correctamente');
         queryClient.invalidateQueries({ queryKey: ['profile'] });
      },
      onError: (error: any) => {
         toast.error(error.response?.data?.msg || 'Error al actualizar perfil');
      }
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
      changePassword: changePasswordMutation.mutate,
      updateProfile: updateProfileMutation.mutateAsync,
      isUpdating: updateProfileMutation.isPending
   };
};
