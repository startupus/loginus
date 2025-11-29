import { Module } from '@nestjs/common';
import { CalculatorController } from './calculator.controller';
// Импорты будут разрешены при установке плагина
// ВНИМАНИЕ: Пути должны быть скорректированы при установке
import { EventsModule } from '../../../core/events/events.module';

/**
 * Calculator Module для плагина calculator-advanced
 * Этот модуль регистрируется при загрузке плагина
 */
@Module({
  imports: [EventsModule],
  controllers: [CalculatorController],
  providers: [],
  exports: [],
})
export class CalculatorModule {}

