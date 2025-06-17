import { ApiService } from '../base/ApiService';
import { CrudOperations, SearchableOperations } from '../base/CrudService';
import type { Partner, InsertPartner, PartnerContact, PartnerFile, PartnerReview } from '@shared/schema';

/**
 * Partner Service implementing Dependency Inversion Principle
 * Depends on abstractions rather than concrete implementations
 */
export class PartnerService 
  extends ApiService<Partner> 
  implements CrudOperations<Partner, InsertPartner>, SearchableOperations<Partner> {

  constructor() {
    super('/api');
  }

  async getAll(): Promise<Partner[]> {
    return this.get<Partner[]>('/partners');
  }

  async getById(id: number): Promise<Partner> {
    return this.get<Partner>(`/partners/${id}`);
  }

  async create(data: InsertPartner): Promise<Partner> {
    return this.post<Partner>('/partners', data);
  }

  async update(id: number, data: Partial<Partner>): Promise<Partner> {
    return this.put<Partner>(`/partners/${id}`, data);
  }

  async remove(id: number): Promise<void> {
    await super.delete(`/partners/${id}`);
  }

  async search(query: string): Promise<Partner[]> {
    return this.get<Partner[]>(`/partners/search?q=${encodeURIComponent(query)}`);
  }

  // Partner-specific operations
  async getContacts(partnerId: number): Promise<PartnerContact[]> {
    return this.get<PartnerContact[]>(`/partners/${partnerId}/contacts`);
  }

  async addContact(partnerId: number, contact: Partial<PartnerContact>): Promise<PartnerContact> {
    return this.post<PartnerContact>(`/partners/${partnerId}/contacts`, contact);
  }

  async updateContact(partnerId: number, contactId: number, data: Partial<PartnerContact>): Promise<PartnerContact> {
    return this.put<PartnerContact>(`/partners/${partnerId}/contacts/${contactId}`, data);
  }

  async deleteContact(partnerId: number, contactId: number): Promise<void> {
    await this.delete(`/partners/${partnerId}/contacts/${contactId}`);
  }

  async getFiles(partnerId: number): Promise<PartnerFile[]> {
    return this.get<PartnerFile[]>(`/partners/${partnerId}/files`);
  }

  async uploadFile(partnerId: number, file: FormData): Promise<PartnerFile> {
    return this.request<PartnerFile>(`/partners/${partnerId}/files`, {
      method: 'POST',
      body: file,
      headers: {}, // Let browser set multipart headers
    });
  }

  async deleteFile(partnerId: number, fileId: number): Promise<void> {
    await this.delete(`/partners/${partnerId}/files/${fileId}`);
  }

  async getReviews(partnerId: number): Promise<PartnerReview[]> {
    return this.get<PartnerReview[]>(`/partners/${partnerId}/reviews`);
  }

  async addReview(partnerId: number, review: Partial<PartnerReview>): Promise<PartnerReview> {
    return this.post<PartnerReview>(`/partners/${partnerId}/reviews`, review);
  }
}