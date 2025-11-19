import { Injectable } from '@nestjs/common';

@Injectable()
export class PersonalService {
  // Mock data
  private documents = [
    { id: '1', type: 'passport_rf', number: '1234 567890', issueDate: '2015-01-15', status: 'active' },
    { id: '2', type: 'driver_license', number: 'AB 1234567', issueDate: '2020-05-20', status: 'active' },
  ];

  private vehicles = [
    { id: '1', brand: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'А123БВ 777', vin: 'JT2BK18E7X0123456' },
  ];

  private pets = [
    { id: '1', name: 'Барсик', type: 'cat', breed: 'Сиамский', birthYear: 2019, chipNumber: 'CH123456789' },
  ];

  private addresses = [
    { id: '1', type: 'home', label: 'Дом', address: 'г. Москва, ул. Ленина, д. 1, кв. 5', postalCode: '101000' },
    { id: '2', type: 'work', label: 'Работа', address: 'г. Москва, ул. Пушкина, д. 10, оф. 301', postalCode: '105000' },
  ];

  // Documents
  getDocuments() {
    // Возвращаем мок данные из profile.json для соответствия структуре
    return {
      success: true,
      data: {
        documents: [
          {
            type: 'passport',
            label: 'Паспорт',
            icon: 'document',
            added: false,
          },
          {
            type: 'foreign-passport',
            label: 'Загранпаспорт',
            icon: 'document',
            added: false,
          },
          {
            type: 'driver-license',
            label: 'ВУ',
            icon: 'car',
            added: false,
          },
          {
            type: 'oms',
            label: 'ОМС',
            icon: 'medical',
            added: false,
          },
          {
            type: 'snils',
            label: 'СНИЛС',
            icon: 'document',
            added: false,
          },
        ],
      },
    };
  }

  addDocument(documentDto: any) {
    const newDocument = {
      id: String(this.documents.length + 1),
      ...documentDto,
      status: 'active',
    };
    this.documents.push(newDocument);
    return {
      success: true,
      data: newDocument,
    };
  }

  // Vehicles
  getVehicles() {
    return {
      success: true,
      data: this.vehicles,
    };
  }

  addVehicle(vehicleDto: any) {
    const newVehicle = {
      id: String(this.vehicles.length + 1),
      ...vehicleDto,
    };
    this.vehicles.push(newVehicle);
    return {
      success: true,
      data: newVehicle,
    };
  }

  // Pets
  getPets() {
    return {
      success: true,
      data: this.pets,
    };
  }

  addPet(petDto: any) {
    const newPet = {
      id: String(this.pets.length + 1),
      ...petDto,
    };
    this.pets.push(newPet);
    return {
      success: true,
      data: newPet,
    };
  }

  // Addresses
  getAddresses() {
    // Возвращаем мок данные из profile.json для соответствия структуре
    return {
      success: true,
      data: {
        addresses: [
          {
            type: 'home',
            label: 'Дом',
            icon: 'home',
            added: false,
          },
          {
            type: 'work',
            label: 'Работа',
            icon: 'briefcase',
            added: false,
          },
          {
            type: 'other',
            label: 'Другие',
            icon: 'map-pin',
            added: false,
          },
        ],
      },
    };
  }

  addAddress(addressDto: any) {
    const newAddress = {
      id: String(this.addresses.length + 1),
      ...addressDto,
    };
    this.addresses.push(newAddress);
    return {
      success: true,
      data: newAddress,
    };
  }
}

