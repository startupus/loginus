import { apiClient } from './client';

export interface Company {
  id: string;
  name: string;
  domain: string;
  settings: {
    branding: {
      logo: string | null;
      primaryColor: string;
    };
    features: {
      familyAccess: boolean;
      biometricAuth: boolean;
      '2fa': boolean;
    };
  };
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesResponse {
  success: boolean;
  data: {
    companies: Company[];
    total: number;
  };
}

export const companiesApi = {
  /**
   * Получить список компаний
   */
  getCompanies: () => apiClient.get<CompaniesResponse>('/admin/companies'),

  /**
   * Получить компанию по ID
   */
  getCompanyById: (id: string) => apiClient.get<{ success: boolean; data: Company }>(`/admin/companies/${id}`),

  /**
   * Создать компанию
   */
  createCompany: (companyData: Partial<Company>) => apiClient.post<{ success: boolean; data: Company }>('/admin/companies', companyData),

  /**
   * Обновить компанию
   */
  updateCompany: (id: string, companyData: Partial<Company>) => apiClient.put<{ success: boolean; data: Company }>(`/admin/companies/${id}`, companyData),
};

