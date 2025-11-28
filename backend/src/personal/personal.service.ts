import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Address } from './entities/address.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Pet } from './entities/pet.entity';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
  ) {}

  async getDocuments(userId: string) {
    // Получаем все документы пользователя
    const userDocuments = await this.documentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Определяем все возможные типы документов
    const allDocumentTypes = [
      { type: 'passport', label: 'Паспорт РФ', icon: 'document' },
      { type: 'internationalPassport', label: 'Загранпаспорт', icon: 'document' },
      { type: 'birthCertificate', label: 'Свидетельство о рождении', icon: 'document' },
      { type: 'drivingLicense', label: 'Водительское удостоверение', icon: 'car' },
      { type: 'vehicleRegistration', label: 'СТС', icon: 'document' },
      { type: 'oms', label: 'ОМС', icon: 'medical' },
      { type: 'dms', label: 'ДМС', icon: 'medical' },
      { type: 'inn', label: 'ИНН', icon: 'document' },
      { type: 'snils', label: 'СНИЛС', icon: 'document' },
    ];

    // Создаем массив всех типов документов БЕЗ информации о добавленных (чтобы избежать дубликатов)
    // Показываем все типы документов, которые НЕ добавлены пользователем
    const documentTypes = allDocumentTypes
      .filter(docType => !userDocuments.some(doc => doc.type === docType.type))
      .map(docType => ({
        type: docType.type,
        label: docType.label,
        icon: docType.icon,
        added: false,
      }));

    // Создаем массив документов пользователя с полной информацией
    const userDocumentsList = userDocuments.map(doc => {
      const docType = allDocumentTypes.find(dt => dt.type === doc.type);
      return {
        id: doc.id,
        type: doc.type,
        label: docType?.label || doc.type,
        icon: docType?.icon || 'document',
        series: doc.series || null,
        number: doc.number,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        issuer: doc.issuer,
        issuePlace: doc.issuer, // Добавляем issuePlace для совместимости с фронтендом
        fileUrl: doc.fileUrl,
        added: true,
      };
    });

    // Возвращаем документы пользователя и все типы документов отдельно
    // Документы пользователя имеют id, типы документов - нет
    // Показываем все типы документов, даже если они уже добавлены (для возможности редактирования)
    const documents = [...userDocumentsList, ...documentTypes];

    console.log('getDocuments - userDocuments:', userDocuments.length, 'documentTypes:', documentTypes.length, 'total:', documents.length);

    return { documents };
  }

  async addDocument(userId: string, documentDto: any) {
    console.log('Adding document for user:', userId, 'Data:', documentDto);
    
    // Преобразуем issueDate из строки в Date, если нужно
    const documentData: any = {
      type: documentDto.type,
      series: documentDto.series || null,
      number: documentDto.number || null,
      issueDate: documentDto.issueDate ? new Date(documentDto.issueDate) : null,
      expiryDate: documentDto.expiryDate ? new Date(documentDto.expiryDate) : null,
      issuer: documentDto.issuePlace || documentDto.issuer || null,
      fileUrl: documentDto.fileUrl || null,
      userId,
    };
    
    const document = this.documentRepository.create(documentData);
    const saved = await this.documentRepository.save(document);
    console.log('Document saved:', (saved as any).id);
    return saved;
  }

  async updateDocument(userId: string, documentId: string, documentDto: any) {
    console.log('Updating document for user:', userId, 'Document ID:', documentId, 'Data:', documentDto);
    
    // Проверяем, что документ принадлежит пользователю
    const existingDocument = await this.documentRepository.findOne({
      where: { id: documentId, userId },
    });
    
    if (!existingDocument) {
      throw new Error('Document not found or access denied');
    }
    
    // Обновляем поля
    if (documentDto.type !== undefined) existingDocument.type = documentDto.type;
    if (documentDto.series !== undefined) existingDocument.series = documentDto.series || null;
    if (documentDto.number !== undefined) existingDocument.number = documentDto.number || null;
    if (documentDto.issueDate !== undefined) {
      existingDocument.issueDate = documentDto.issueDate ? new Date(documentDto.issueDate) : null;
    }
    if (documentDto.expiryDate !== undefined) {
      existingDocument.expiryDate = documentDto.expiryDate ? new Date(documentDto.expiryDate) : null;
    }
    if (documentDto.issuePlace !== undefined || documentDto.issuer !== undefined) {
      existingDocument.issuer = documentDto.issuePlace || documentDto.issuer || null;
    }
    // Обновляем fileUrl только если он передан (новый файл загружен или явно указан)
    // Если fileUrl не передан, сохраняем существующий
    if (documentDto.fileUrl !== undefined) {
      existingDocument.fileUrl = documentDto.fileUrl || null;
    }
    
    const saved = await this.documentRepository.save(existingDocument);
    console.log('Document updated:', saved.id);
    return saved;
  }

  async getVehicles(userId: string) {
    const vehicles = await this.vehicleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return vehicles;
  }

  async addVehicle(userId: string, vehicleDto: any) {
    console.log('Adding vehicle for user:', userId, 'Data:', vehicleDto);
    
    const vehicle = this.vehicleRepository.create({
      type: vehicleDto.type || 'car',
      brand: vehicleDto.brand || null,
      model: vehicleDto.model || null,
      year: vehicleDto.year || null,
      licensePlate: vehicleDto.licensePlate || null,
      vin: vehicleDto.vin || null,
      userId,
    });
    
    const saved = await this.vehicleRepository.save(vehicle);
    console.log('Vehicle saved:', saved.id);
    return saved;
  }

  async getPets(userId: string) {
    const pets = await this.petRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return pets;
  }

  async addPet(userId: string, petDto: any) {
    console.log('Adding pet for user:', userId, 'Data:', petDto);
    
    const pet = this.petRepository.create({
      name: petDto.name,
      type: petDto.type,
      breed: petDto.breed || null,
      birthDate: petDto.birthDate || null,
      photoUrl: petDto.photoUrl || null,
      userId,
    });
    
    const saved = await this.petRepository.save(pet);
    console.log('Pet saved:', saved.id);
    return saved;
  }

  async getAddresses(userId: string) {
    // Получаем все адреса пользователя
    const userAddresses = await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    // Определяем все возможные типы адресов
    const allAddressTypes = [
      { type: 'home', label: 'Домашний', icon: 'home' },
      { type: 'work', label: 'Рабочий', icon: 'briefcase' },
      { type: 'other', label: 'Другой', icon: 'map-pin' },
    ];

    // Создаем массив всех типов адресов БЕЗ информации о добавленных (чтобы избежать дубликатов)
    // Показываем все типы адресов, которые НЕ добавлены пользователем
    const addressTypes = allAddressTypes
      .filter(addrType => !userAddresses.some(addr => addr.type === addrType.type))
      .map(addrType => ({
        type: addrType.type,
        label: addrType.label,
        icon: addrType.icon,
        added: false,
      }));

    // Создаем массив адресов пользователя с полной информацией
    const userAddressesList = userAddresses.map(addr => {
      const addrType = allAddressTypes.find(at => at.type === addr.type);
      return {
        id: addr.id,
        type: addr.type,
        label: addrType?.label || addr.type,
        icon: addrType?.icon || 'map-pin',
        street: addr.street,
        city: addr.city,
        region: addr.region,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
        address: `${addr.street}, ${addr.city}${addr.region ? `, ${addr.region}` : ''}${addr.postalCode ? `, ${addr.postalCode}` : ''}`,
        added: true,
      };
    });

    // Возвращаем адреса пользователя и все типы адресов отдельно
    // Адреса пользователя имеют id, типы адресов - нет
    // Показываем все типы адресов, даже если они уже добавлены (для возможности редактирования)
    const addresses = [...userAddressesList, ...addressTypes];

    console.log('getAddresses - userAddresses:', userAddresses.length, 'addressTypes:', addressTypes.length, 'total:', addresses.length);

    return { addresses };
  }

  async addAddress(userId: string, addressDto: any) {
    console.log('Adding address for user:', userId, 'Data:', addressDto);
    
    // Если это адрес по умолчанию, снимаем флаг с других адресов
    if (addressDto.isDefault) {
      await this.addressRepository.update(
        { userId },
        { isDefault: false },
      );
    }
    
    // Формируем полный адрес из компонентов
    const addressParts: string[] = [];
    if (addressDto.street) addressParts.push(addressDto.street);
    if (addressDto.house) addressParts.push(`д. ${addressDto.house}`);
    if (addressDto.apartment) addressParts.push(`кв. ${addressDto.apartment}`);
    
    const fullStreet = addressParts.length > 0 ? addressParts.join(', ') : addressDto.street || '';
    
    const address = this.addressRepository.create({
      type: addressDto.type || 'home',
      street: fullStreet,
      city: addressDto.city || '',
      region: addressDto.region || null,
      postalCode: addressDto.postalCode || null,
      country: addressDto.country || 'Россия',
      isDefault: addressDto.isDefault || false,
      userId,
    });
    
    const saved = await this.addressRepository.save(address);
    console.log('Address saved:', saved.id);
    return saved;
  }

  async updateAddress(userId: string, addressId: string, addressDto: any) {
    console.log('Updating address for user:', userId, 'Address ID:', addressId, 'Data:', addressDto);
    
    // Проверяем, что адрес принадлежит пользователю
    const existingAddress = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });
    
    if (!existingAddress) {
      throw new Error('Address not found or access denied');
    }
    
    // Если это адрес по умолчанию, снимаем флаг с других адресов
    if (addressDto.isDefault) {
      await this.addressRepository
        .createQueryBuilder()
        .update()
        .set({ isDefault: false })
        .where('userId = :userId AND id != :addressId', { userId, addressId })
        .execute();
    }
    
    // Формируем полный адрес из компонентов
    const addressParts: string[] = [];
    if (addressDto.street) addressParts.push(addressDto.street);
    if (addressDto.house) addressParts.push(`д. ${addressDto.house}`);
    if (addressDto.apartment) addressParts.push(`кв. ${addressDto.apartment}`);
    
    const fullStreet = addressParts.length > 0 ? addressParts.join(', ') : addressDto.street || '';
    
    // Обновляем поля
    if (addressDto.type !== undefined) existingAddress.type = addressDto.type || 'home';
    if (addressDto.street !== undefined || addressDto.house !== undefined || addressDto.apartment !== undefined) {
      existingAddress.street = fullStreet;
    }
    if (addressDto.city !== undefined) existingAddress.city = addressDto.city || '';
    if (addressDto.region !== undefined) existingAddress.region = addressDto.region || null;
    if (addressDto.postalCode !== undefined) existingAddress.postalCode = addressDto.postalCode || null;
    if (addressDto.country !== undefined) existingAddress.country = addressDto.country || 'Россия';
    if (addressDto.isDefault !== undefined) existingAddress.isDefault = addressDto.isDefault || false;
    
    const saved = await this.addressRepository.save(existingAddress);
    console.log('Address updated:', saved.id);
    return saved;
  }
}

