import { Controller, Get, Post, Put, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { PersonalService } from './personal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('personal')
@Controller('personal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Get('documents')
  @ApiOperation({ summary: 'Получить документы' })
  @ApiResponse({ status: 200, description: 'Список документов' })
  async getDocuments(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.getDocuments(userId);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Добавить документ' })
  @ApiResponse({ status: 201, description: 'Документ добавлен' })
  async addDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    
    // Сохраняем файл, если он есть
    let fileUrl: string | null = null;
    if (file) {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
      
      console.log('File upload started:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadsDir,
      });
      
      // Создаем директорию, если её нет
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      }
      
      // Генерируем уникальное имя файла
      const uniqueName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadsDir, uniqueName);
      
      // Сохраняем файл
      try {
        fs.writeFileSync(filePath, file.buffer);
        console.log('File saved successfully:', filePath);
        fileUrl = `/uploads/documents/${uniqueName}`;
        console.log('File URL:', fileUrl);
      } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
      }
    } else {
      console.log('No file provided in request');
    }
    
    // Парсим данные из FormData
    const documentDto: any = {
      type: req.body.type,
      number: req.body.number,
      series: req.body.series || null,
      issueDate: req.body.issueDate || null,
      issuePlace: req.body.issuePlace || null,
      fileUrl,
    };
    
    return this.personalService.addDocument(userId, documentDto);
  }

  @Put('documents/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Обновить документ' })
  @ApiResponse({ status: 200, description: 'Документ обновлен' })
  async updateDocument(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    
    // Сохраняем файл, если он есть
    let fileUrl: string | undefined = undefined;
    if (file) {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
      
      console.log('File update upload started:', {
        documentId,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadsDir,
      });
      
      // Создаем директорию, если её нет
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      }
      
      // Генерируем уникальное имя файла
      const uniqueName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadsDir, uniqueName);
      
      // Сохраняем файл
      try {
        fs.writeFileSync(filePath, file.buffer);
        console.log('File saved successfully:', filePath);
        fileUrl = `/uploads/documents/${uniqueName}`;
        console.log('File URL:', fileUrl);
      } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
      }
    } else {
      console.log('No file provided in update request, keeping existing file');
    }
    
    // Парсим данные из FormData
    const documentDto: any = {
      type: req.body.type,
      number: req.body.number,
      series: req.body.series || null,
      issueDate: req.body.issueDate || null,
      issuePlace: req.body.issuePlace || null,
    };
    
    // Если файл загружен, используем новый URL
    // Если файл не загружен, но передан fileUrl, сохраняем его (старый файл)
    // Если ничего не передано, fileUrl остается undefined и не обновится в сервисе
    if (fileUrl !== undefined) {
      documentDto.fileUrl = fileUrl;
    } else if (req.body.fileUrl) {
      documentDto.fileUrl = req.body.fileUrl;
    }
    
    return this.personalService.updateDocument(userId, documentId, documentDto);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Получить транспортные средства' })
  @ApiResponse({ status: 200, description: 'Список транспортных средств' })
  async getVehicles(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.getVehicles(userId);
  }

  @Post('vehicles')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Добавить транспортное средство' })
  @ApiResponse({ status: 201, description: 'Транспортное средство добавлено' })
  async addVehicle(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    
    console.log('Adding vehicle - req.body:', req.body);
    console.log('Adding vehicle - file:', file?.filename);
    
    const vehicleDto: any = {
      type: 'car', // По умолчанию
      brand: req.body.brand || null,
      model: req.body.model || null,
      licensePlate: req.body.licensePlate || null,
      year: req.body.year ? parseInt(req.body.year, 10) : null,
      vin: req.body.sts || null, // Используем sts как VIN
      photoUrl: file ? `/uploads/vehicles/${file.filename}` : null,
    };
    
    console.log('Vehicle DTO:', vehicleDto);
    
    return this.personalService.addVehicle(userId, vehicleDto);
  }

  @Get('pets')
  @ApiOperation({ summary: 'Получить питомцев' })
  @ApiResponse({ status: 200, description: 'Список питомцев' })
  async getPets(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.getPets(userId);
  }

  @Post('pets')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Добавить питомца' })
  @ApiResponse({ status: 201, description: 'Питомец добавлен' })
  async addPet(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    
    console.log('Adding pet - req.body:', req.body);
    console.log('Adding pet - file:', file?.filename);
    
    const petDto: any = {
      name: req.body.name || null,
      type: req.body.type || 'dog',
      breed: req.body.breed || null,
      birthDate: req.body.birthDate ? new Date(req.body.birthDate) : null,
      photoUrl: file ? `/uploads/pets/${file.filename}` : null,
    };
    
    console.log('Pet DTO:', petDto);
    
    return this.personalService.addPet(userId, petDto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Получить адреса' })
  @ApiResponse({ status: 200, description: 'Список адресов' })
  async getAddresses(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Добавить адрес' })
  @ApiResponse({ status: 201, description: 'Адрес добавлен' })
  async addAddress(@CurrentUser() user: any, @Body() addressDto: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.addAddress(userId, addressDto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Обновить адрес' })
  @ApiResponse({ status: 200, description: 'Адрес обновлен' })
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() addressDto: any,
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.personalService.updateAddress(userId, addressId, addressDto);
  }
}

