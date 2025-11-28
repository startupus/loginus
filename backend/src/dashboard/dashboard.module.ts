import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { UserBalance } from './entities/user-balance.entity';
import { UserGamePoints } from './entities/user-game-points.entity';
import { Achievement } from './entities/achievement.entity';
import { Course } from './entities/course.entity';
import { Event } from './entities/event.entity';
import { RoadmapStep } from './entities/roadmap-step.entity';
import { Subscription } from './entities/subscription.entity';
import { UserUnreadMail } from './entities/user-unread-mail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBalance,
      UserGamePoints,
      Achievement,
      Course,
      Event,
      RoadmapStep,
      Subscription,
      UserUnreadMail,
    ]),
  ],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

