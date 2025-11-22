/**
 * Help API - API клиент для работы со справкой
 * Использует единый backend API через NestJS
 */

import { apiClient } from './client';

export interface HelpCategory {
  id: string;
  icon: string;
  title: string;
  links: HelpLink[];
}

export interface HelpLink {
  text: string;
  href: string;
}

export interface HelpCategoriesResponse {
  success: boolean;
  data: HelpCategory[];
}

export interface HelpCategoryResponse {
  success: boolean;
  data: HelpCategory | null;
}

export const helpApi = {
  /**
   * Получить все категории справки
   */
  getCategories: async (): Promise<HelpCategoriesResponse> => {
    const response = await apiClient.get('/help/categories');
    return response.data;
  },

  /**
   * Получить категорию по ID
   */
  getCategoryById: async (id: string): Promise<HelpCategoryResponse> => {
    const response = await apiClient.get(`/help/categories/${id}`);
    return response.data;
  },
};

