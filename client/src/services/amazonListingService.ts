// Amazon Listing Service - Single Responsibility
import type { 
  AmazonListingFormData, 
  AmazonListingSession, 
  ProcessingStep 
} from '@/types/amazon-listing';

class AmazonListingService {
  private readonly baseUrl = '/api';

  // Session Management
  async createSession(userId: string): Promise<AmazonListingSession> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        agentType: 'amazon-listing-optimizer' 
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  }

  async updateSession(sessionId: string, formData: AmazonListingFormData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputData: formData })
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }
  }

  // File Processing
  async processFiles(sessionId: string, files: File[]): Promise<string> {
    const filesData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        content: await this.readFileAsText(file)
      }))
    );

    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/files/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filesData })
    });

    if (!response.ok) {
      throw new Error(`Failed to process files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.combinedContent;
  }

  // AI Processing
  async processListing(formData: AmazonListingFormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/agents/amazon-listings-optimizer/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Failed to process listing: ${response.statusText}`);
    }

    return response.json();
  }

  // Data Fetching
  async getDepartments(): Promise<Array<{ id: number; name: string; description?: string }>> {
    const response = await fetch(`${this.baseUrl}/departments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  // Utility Methods
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Export functionality
  downloadResults(analysis: string, titles: string, filename: string = 'amazon-listing-results'): void {
    const content = `ANÁLISE DAS AVALIAÇÕES\n\n${analysis}\n\n\nTÍTULOS GERADOS\n\n${titles}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const amazonListingService = new AmazonListingService();