import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';
import { Document } from './entities/document.entity';
import { Address } from './entities/address.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Pet } from './entities/pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Address, Vehicle, Pet])],
  controllers: [PersonalController],
  providers: [PersonalService],
  exports: [PersonalService],
})
export class PersonalModule {}

