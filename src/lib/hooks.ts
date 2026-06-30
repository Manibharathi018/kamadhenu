import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  updateUserMetadata,
  fetchUserOrders,
  type Product,
} from './supabase';

// Product queries
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    staleTime: 1000 * 60 * 5,
  });
};

// Product mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string }) =>
      createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Alias for admin use
export const useAddProduct = () => {
  return useCreateProduct();
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Auth mutations
export const useSignUp = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
      metadata,
    }: {
      email: string;
      password: string;
      metadata?: { full_name?: string; phone?: string; address?: string };
    }) => signUp(email, password, metadata),
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useUpdateUserMetadata = () => {
  return useMutation({
    mutationFn: (metadata: {
      full_name?: string;
      phone?: string;
      address?: string;
    }) => updateUserMetadata(metadata),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
};

export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
};
