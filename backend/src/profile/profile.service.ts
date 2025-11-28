import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserAdapter } from '../common/adapters/user.adapter';
import { DashboardService } from '../dashboard/dashboard.service';
import { PersonalService } from '../personal/personal.service';
import { FamilyService } from '../family/family.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dashboardService: DashboardService,
    private readonly personalService: PersonalService,
    private readonly familyService: FamilyService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return UserAdapter.toFrontendFormat(user);
  }

  async getDashboard(userId: string) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userData = UserAdapter.toFrontendFormat(user);

      // Получаем все данные параллельно
      const [dashboardData, documentsData, addressesData, petsData, vehiclesData, familyData] = await Promise.all([
        this.dashboardService.getDashboardData(userId),
        this.personalService.getDocuments(userId).catch(err => {
          console.error('Error getting documents:', err);
          return { documents: [] };
        }),
        this.personalService.getAddresses(userId).catch(err => {
          console.error('Error getting addresses:', err);
          return { addresses: [] };
        }),
        this.personalService.getPets(userId).catch(err => {
          console.error('Error getting pets:', err);
          return [];
        }),
        this.personalService.getVehicles(userId).catch(err => {
          console.error('Error getting vehicles:', err);
          return [];
        }),
        this.familyService.getMembers(userId).catch(err => {
          console.error('Error getting family members:', err);
          return { members: [], isCreator: false };
        }),
      ]);

      // Возвращаем структуру, ожидаемую фронтендом
      return {
        user: userData,
        dashboard: {
          ...dashboardData,
          documents: documentsData?.documents || [],
          addresses: addressesData?.addresses || [],
          pets: petsData || [],
          vehicles: vehiclesData || [],
          family: familyData?.members || [],
          familyIsCreator: familyData?.isCreator || false, // Добавляем информацию о создателе
        },
      };
    } catch (error) {
      console.error('Error in getDashboard:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updateDto: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    birthday: string;
  }>) {
    const user = await this.usersService.update(userId, updateDto);
    return UserAdapter.toFrontendFormat(user);
  }
}

