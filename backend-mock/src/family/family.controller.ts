import { Controller, Get, Post, Body } from '@nestjs/common';
import { FamilyService } from './family.service';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get('members')
  getMembers() {
    return this.familyService.getMembers();
  }

  @Post('invite')
  inviteMember(@Body() inviteDto: { email: string; role: 'member' | 'child' }) {
    return this.familyService.inviteMember(inviteDto);
  }

  @Post('child-account')
  createChildAccount(@Body() childDto: { name: string; birthDate: string }) {
    return this.familyService.createChildAccount(childDto);
  }
}
