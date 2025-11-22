import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query() query: {
    page?: number;
    limit?: number;
    companyId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  createUser(@Body() userData: any) {
    return this.adminService.createUser(userData);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.adminService.updateUser(id, userData);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('companies/:companyId/users')
  getUsersByCompany(@Param('companyId') companyId: string) {
    return this.adminService.getUsersByCompany(companyId);
  }

  @Get('companies')
  getCompanies() {
    return this.adminService.getCompanies();
  }

  @Get('companies/:id')
  getCompanyById(@Param('id') id: string) {
    return this.adminService.getCompanyById(id);
  }

  @Post('companies')
  createCompany(@Body() companyData: any) {
    return this.adminService.createCompany(companyData);
  }

  @Put('companies/:id')
  updateCompany(@Param('id') id: string, @Body() companyData: any) {
    return this.adminService.updateCompany(id, companyData);
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}

