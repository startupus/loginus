import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from './entities/user-balance.entity';
import { UserGamePoints } from './entities/user-game-points.entity';
import { Achievement } from './entities/achievement.entity';
import { Course } from './entities/course.entity';
import { Event } from './entities/event.entity';
import { RoadmapStep } from './entities/roadmap-step.entity';
import { Subscription } from './entities/subscription.entity';
import { UserUnreadMail } from './entities/user-unread-mail.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserBalance)
    private readonly userBalanceRepository: Repository<UserBalance>,
    @InjectRepository(UserGamePoints)
    private readonly userGamePointsRepository: Repository<UserGamePoints>,
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(RoadmapStep)
    private readonly roadmapStepRepository: Repository<RoadmapStep>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UserUnreadMail)
    private readonly userUnreadMailRepository: Repository<UserUnreadMail>,
  ) {}

  async getDashboardData(userId: string) {
    // Получаем или создаем баланс
    let balance = await this.userBalanceRepository.findOne({ where: { userId } });
    if (!balance) {
      balance = this.userBalanceRepository.create({ userId, balance: 0, payBalance: 0, payLimit: 0 });
      balance = await this.userBalanceRepository.save(balance);
    }

    // Получаем или создаем игровые очки
    let gamePoints = await this.userGamePointsRepository.findOne({ where: { userId } });
    if (!gamePoints) {
      gamePoints = this.userGamePointsRepository.create({
        userId,
        gamePoints: 0,
        plusPoints: 0,
        plusActive: false,
        plusTasks: 0,
      });
      gamePoints = await this.userGamePointsRepository.save(gamePoints);
    }

    // Получаем или создаем счетчик непрочитанной почты
    let unreadMail = await this.userUnreadMailRepository.findOne({ where: { userId } });
    if (!unreadMail) {
      unreadMail = this.userUnreadMailRepository.create({ userId, unreadCount: 0 });
      unreadMail = await this.userUnreadMailRepository.save(unreadMail);
    }

    // Получаем остальные данные
    const [achievements, courses, events, roadmapSteps, subscriptions] = await Promise.all([
      this.achievementRepository.find({
        where: { userId },
        order: { unlockedAt: 'DESC' },
        take: 10,
      }),
      this.courseRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.eventRepository.find({
        where: { userId },
        order: { date: 'DESC' },
        take: 10,
      }),
      this.roadmapStepRepository.find({
        where: { userId },
        order: { order: 'ASC' },
      }),
      this.subscriptionRepository.find({
        where: { userId, active: true },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      balance: Number(balance.balance),
      payBalance: Number(balance.payBalance),
      payLimit: Number(balance.payLimit),
      gamePoints: gamePoints.gamePoints,
      plusPoints: gamePoints.plusPoints,
      plusActive: gamePoints.plusActive,
      plusTasks: gamePoints.plusTasks,
      achievements: achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
      })),
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        progress: c.progress,
        icon: c.icon,
        color: c.color,
      })),
      events: events.map(e => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        icon: e.icon,
        color: e.color,
        date: e.date.toISOString(),
      })),
      roadmap: roadmapSteps.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        completed: r.completed,
        order: r.order,
      })),
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        type: s.type,
        name: s.name,
        price: s.price,
        pricePerMonth: s.pricePerMonth,
        badge: s.badge,
        active: s.active,
        expiresAt: s.expiresAt?.toISOString(),
      })),
      unreadMail: unreadMail.unreadCount,
    };
  }
}

