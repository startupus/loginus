import { apiClient } from './client';

export const personalApi = {
  // Documents
  getDocuments: () => apiClient.get('/personal/documents'),
  addDocument: (data: any) => apiClient.post('/personal/documents', data),
  
  // Vehicles
  getVehicles: () => apiClient.get('/personal/vehicles'),
  addVehicle: (data: any) => apiClient.post('/personal/vehicles', data),
  
  // Pets
  getPets: () => apiClient.get('/personal/pets'),
  addPet: (data: any) => apiClient.post('/personal/pets', data),
  
  // Addresses
  getAddresses: () => apiClient.get('/personal/addresses'),
  addAddress: (data: any) => apiClient.post('/personal/addresses', data),
};

