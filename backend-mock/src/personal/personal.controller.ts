import { Controller, Get, Post, Body } from '@nestjs/common';
import { PersonalService } from './personal.service';

@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  // Documents
  @Get('documents')
  getDocuments() {
    return this.personalService.getDocuments();
  }

  @Post('documents')
  addDocument(@Body() documentDto: any) {
    return this.personalService.addDocument(documentDto);
  }

  // Vehicles
  @Get('vehicles')
  getVehicles() {
    return this.personalService.getVehicles();
  }

  @Post('vehicles')
  addVehicle(@Body() vehicleDto: any) {
    return this.personalService.addVehicle(vehicleDto);
  }

  // Pets
  @Get('pets')
  getPets() {
    return this.personalService.getPets();
  }

  @Post('pets')
  addPet(@Body() petDto: any) {
    return this.personalService.addPet(petDto);
  }

  // Addresses
  @Get('addresses')
  getAddresses() {
    return this.personalService.getAddresses();
  }

  @Post('addresses')
  addAddress(@Body() addressDto: any) {
    return this.personalService.addAddress(addressDto);
  }
}

