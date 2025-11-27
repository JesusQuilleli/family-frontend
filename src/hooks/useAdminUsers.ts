import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../actions/user-actions';
import { useState } from 'react';

export const useAdminUsers = () => {
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState('');

   const { data, isLoading, error } = useQuery({
      queryKey: ['users', page, search],
      queryFn: () => getAllUsers(page, 10, search),
      staleTime: 1000 * 60 * 5, // 5 minutes
   });

   return {
      users: data?.users || [],
      totalUsers: data?.totalUsers || 0,
      totalPages: data?.totalPages || 1,
      currentPage: data?.currentPage || 1,
      isLoading,
      error,
      page,
      setPage,
      search,
      setSearch
   };
};
