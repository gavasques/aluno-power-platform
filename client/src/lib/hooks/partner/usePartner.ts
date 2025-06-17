import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PartnerService } from '@/lib/services/partner/PartnerService';
import type { Partner, InsertPartner, PartnerContact, PartnerFile, PartnerReview } from '@shared/schema';

const partnerService = new PartnerService();

// Query Keys - centralized for cache management
export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...partnerKeys.lists(), { filters }] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: number) => [...partnerKeys.details(), id] as const,
  contacts: (id: number) => [...partnerKeys.detail(id), 'contacts'] as const,
  files: (id: number) => [...partnerKeys.detail(id), 'files'] as const,
  reviews: (id: number) => [...partnerKeys.detail(id), 'reviews'] as const,
};

// Partners CRUD operations
export const usePartners = () => {
  return useQuery({
    queryKey: partnerKeys.lists(),
    queryFn: () => partnerService.getAll(),
  });
};

export const usePartner = (id: number) => {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnerService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertPartner) => partnerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Partner> }) => 
      partnerService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => partnerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
};

// Partner Contacts operations
export const usePartnerContacts = (partnerId: number) => {
  return useQuery({
    queryKey: partnerKeys.contacts(partnerId),
    queryFn: () => partnerService.getContacts(partnerId),
    enabled: !!partnerId,
  });
};

export const useAddPartnerContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partnerId, contact }: { partnerId: number; contact: Partial<PartnerContact> }) =>
      partnerService.addContact(partnerId, contact),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.contacts(partnerId) });
    },
  });
};

// Partner Files operations
export const usePartnerFiles = (partnerId: number) => {
  return useQuery({
    queryKey: partnerKeys.files(partnerId),
    queryFn: () => partnerService.getFiles(partnerId),
    enabled: !!partnerId,
  });
};

export const useUploadPartnerFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: number; file: FormData }) =>
      partnerService.uploadFile(partnerId, file),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.files(partnerId) });
    },
  });
};

// Partner Reviews operations
export const usePartnerReviews = (partnerId: number) => {
  return useQuery({
    queryKey: partnerKeys.reviews(partnerId),
    queryFn: () => partnerService.getReviews(partnerId),
    enabled: !!partnerId,
  });
};

export const useAddPartnerReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partnerId, review }: { partnerId: number; review: Partial<PartnerReview> }) =>
      partnerService.addReview(partnerId, review),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.reviews(partnerId) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(partnerId) });
    },
  });
};