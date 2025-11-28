import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PaymentMethod,
  PaymentMethodStatus,
  PaymentMethodType,
} from './entities/payment-method.entity';

interface CreatePaymentMethodDto {
  type: PaymentMethodType;
  bankName: string;
  lastFour?: string;
  accountNumber?: string;
  expiryDate?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepo: Repository<PaymentMethod>,
  ) {}

  async getMethods() {
    const methods = await this.paymentMethodsRepo.find({
      order: {
        order: 'ASC',
        createdAt: 'ASC',
      },
    });

    return {
      success: true,
      data: methods,
    };
  }

  async addMethod(methodDto: CreatePaymentMethodDto) {
    this.validateMethodDto(methodDto);

    const nextOrder = await this.computeNextOrder();

    const method = this.paymentMethodsRepo.create({
      type: methodDto.type,
      bankName: methodDto.bankName,
      lastFour: methodDto.type === 'card' ? methodDto.lastFour ?? null : null,
      accountNumber:
        methodDto.type === 'bank_account' ? methodDto.accountNumber ?? null : null,
      expiryDate: methodDto.type === 'card' ? methodDto.expiryDate ?? null : null,
      status: 'active',
      order: nextOrder,
    });

    const saved = await this.paymentMethodsRepo.save(method);

    return {
      success: true,
      data: saved,
    };
  }

  async toggleMethod(id: string) {
    const method = await this.paymentMethodsRepo.findOne({ where: { id } });
    if (!method) {
      throw new BadRequestException('Payment method not found');
    }

    method.status = (method.status === 'active' ? 'inactive' : 'active') as PaymentMethodStatus;
    const saved = await this.paymentMethodsRepo.save(method);

    return {
      success: true,
      data: saved,
    };
  }

  async reorder(methodIds: string[]) {
    if (!methodIds?.length) {
      return {
        success: true,
        data: [],
      };
    }

    const existing = await this.paymentMethodsRepo.find({
      where: { id: In(methodIds) },
    });

    const updates = methodIds.map((id, index) => {
      const method = existing.find((item) => item.id === id);
      if (!method) {
        return null;
      }
      method.order = index + 1;
      return method;
    }).filter((item): item is PaymentMethod => item !== null);

    if (updates.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    await this.paymentMethodsRepo.save(updates);
    return {
      success: true,
      data: updates,
    };
  }

  async getHistory() {
    // Реальных транзакций пока нет, возвращаем пустой список
    return {
      success: true,
      data: [],
    };
  }

  private validateMethodDto(method: CreatePaymentMethodDto) {
    if (!method.bankName?.trim()) {
      throw new BadRequestException('Bank name is required');
    }

    if (method.type === 'card') {
      if (!method.lastFour || !/^\d{4}$/.test(method.lastFour)) {
        throw new BadRequestException('Card last four digits are invalid');
      }
      if (method.expiryDate && !/^\d{2}\/\d{2}$/.test(method.expiryDate)) {
        throw new BadRequestException('Expiry date must be in MM/YY format');
      }
    }

    if (method.type === 'bank_account') {
      if (!method.accountNumber?.trim()) {
        throw new BadRequestException('Account number is required for bank accounts');
      }
    }
  }

  private async computeNextOrder(): Promise<number> {
    const last = await this.paymentMethodsRepo
      .createQueryBuilder('method')
      .orderBy('method.order', 'DESC')
      .getOne();

    if (!last) {
      return 1;
    }

    return (last.order || 0) + 1;
  }
}

