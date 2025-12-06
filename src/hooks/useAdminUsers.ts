import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../actions/user-actions';
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export const useAdminUsers = () => {
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState('');
   const [showDeleted, setShowDeleted] = useState(false);

   const debouncedSearch = useDebounce(search, 500);

   // Reset page when search changes
   useEffect(() => {
      setPage(1);
   }, [debouncedSearch, showDeleted]);

   const { data, isLoading, error } = useQuery({
      queryKey: ['users', page, debouncedSearch, showDeleted],
      queryFn: () => getAllUsers(page, 10, debouncedSearch, showDeleted),
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
      setSearch,
      showDeleted,
      setShowDeleted
   };
};
