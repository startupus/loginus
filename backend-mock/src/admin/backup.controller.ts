import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('admin/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  // Синхронизация

  @Get('sync/settings')
  getSyncSettings() {
    return {
      success: true,
      data: this.backupService.getSyncSettings(),
    };
  }

  @Put('sync/settings')
  updateSyncSettings(@Body() settings: any) {
    return {
      success: true,
      data: this.backupService.updateSyncSettings(settings),
    };
  }

  @Post('sync/test')
  async testSyncConnection(@Body() body: { url: string; apiKey: string }) {
    const result = await this.backupService.testSyncConnection(body.url, body.apiKey);
    return {
      success: result.connected,
      data: result,
    };
  }

  @Post('sync/run')
  async runSync() {
    const result = await this.backupService.runSync();
    return {
      success: result.success,
      data: result,
    };
  }

  @Get('sync/status')
  getSyncStatus() {
    return {
      success: true,
      data: this.backupService.getSyncStatus(),
    };
  }

  // Бекапы

  @Get('settings')
  getBackupSettings() {
    return {
      success: true,
      data: this.backupService.getBackupSettings(),
    };
  }

  @Put('settings')
  updateBackupSettings(@Body() settings: any) {
    return {
      success: true,
      data: this.backupService.updateBackupSettings(settings),
    };
  }

  @Post('create')
  async createBackup(@Body() options: { include: { users: boolean; settings: boolean; logs: boolean } }) {
    const backup = await this.backupService.createBackup(options);
    return {
      success: true,
      data: backup,
    };
  }

  @Get('history')
  getBackupHistory(@Query() query: {
    type?: 'auto' | 'manual';
    status?: 'success' | 'in-progress' | 'error';
    dateFrom?: string;
    dateTo?: string;
  }) {
    return {
      success: true,
      data: this.backupService.getBackupHistory(query),
    };
  }

  @Get('stats')
  getBackupStats() {
    return {
      success: true,
      data: this.backupService.getBackupStats(),
    };
  }

  @Get(':id/download')
  downloadBackup(@Param('id') id: string) {
    const backup = this.backupService.getBackupById(id);
    if (!backup) {
      return {
        success: false,
        error: 'Бекап не найден',
      };
    }
    // В реальном приложении здесь был бы файл для скачивания
    // В моке просто возвращаем информацию о бекапе
    return {
      success: true,
      data: {
        id: backup.id,
        downloadUrl: `/api/admin/backup/${id}/file`,
        size: backup.size,
      },
    };
  }

  @Post(':id/restore')
  async restoreBackup(
    @Param('id') id: string,
    @Body() options: { restoreUsers: boolean; restoreSettings: boolean; restoreLogs: boolean }
  ) {
    const result = await this.backupService.restoreBackup(id, options);
    return {
      success: result.success,
      data: result,
    };
  }

  @Delete(':id')
  deleteBackup(@Param('id') id: string) {
    const result = this.backupService.deleteBackup(id);
    return {
      success: result.success,
      data: result,
    };
  }
}

