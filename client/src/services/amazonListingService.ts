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
    const response = await fetch(`${this.baseUrl}/amazon-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idUsuario: userId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  }

  async updateSession(sessionId: string, formData: AmazonListingFormData): Promise<void> {
    // Map English field names to Portuguese for backend compatibility
    const mappedData = {
      nomeProduto: formData.productName,
      marca: formData.brand,
      categoria: formData.category,
      keywords: formData.keywords,
      longTailKeywords: formData.longTailKeywords,
      principaisCaracteristicas: formData.features,
      publicoAlvo: formData.targetAudience,
      reviewsData: formData.reviewsData
    };

    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedData)
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

    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/files/process`, {
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

  // AI Processing - Two Step Process
  async processStep1(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to process step 1: ${response.statusText}`);
    }

    return response.json();
  }

  async processStep2(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/step2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to process step 2: ${response.statusText}`);
    }

    return response.json();
  }

  async abortProcessing(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/abort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to abort processing: ${response.statusText}`);
    }
  }

  async getSession(sessionId: string): Promise<AmazonListingSession> {
    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  }

  async downloadResults(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/amazon-sessions/${sessionId}/download`);

    if (!response.ok) {
      throw new Error(`Failed to download results: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amazon-listing-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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


}

export const amazonListingService = new AmazonListingService();