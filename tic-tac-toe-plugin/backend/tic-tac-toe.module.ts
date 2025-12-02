import { Module } from '@nestjs/common';
import { TicTacToeController } from './tic-tac-toe.controller';
import { EventsModule } from '../../../core/events/events.module';

/**
 * Tic Tac Toe Module для плагина tic-tac-toe
 */
@Module({
  imports: [EventsModule],
  controllers: [TicTacToeController],
  providers: [],
  exports: [],
})
export class TicTacToeModule {}

