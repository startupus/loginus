// ✅ ИСПРАВЛЕНИЕ: Убираем декораторы NestJS, так как они не работают при динамической загрузке
// Используем простой класс с методами-обработчиками

export class MakeMoveDto {
  position: number;
  userId?: string;
}

export class ResetGameDto {
  playerSymbol?: 'X' | 'O';
  userId?: string;
}

/**
 * Tic Tac Toe Controller для плагина tic-tac-toe
 * 
 * ВАЖНО: 
 * - Зависимости передаются через конструктор при создании экземпляра
 * - НЕ используем декораторы NestJS (@Controller, @Post, @Body) - они не работают при динамической загрузке
 * - Методы вызываются напрямую через PluginRouterService
 */
export class TicTacToeController {
  private games: Map<string, any> = new Map(); // userId -> game state
  private eventBus: any;
  private PLUGIN_EVENTS: any;

  constructor(eventBus?: any, pluginEvents?: any) {
    this.eventBus = eventBus;
    this.PLUGIN_EVENTS = pluginEvents;
  }

  /**
   * Сделать ход
   * POST /api/v2/plugins/tic-tac-toe/tic-tac-toe/move
   * Вызывается через PluginRouterService.callPluginHandler()
   */
  async makeMove(body: MakeMoveDto, query: any, req: any) {
    // ✅ ВАЛИДАЦИЯ: Проверяем вручную
    if (!body || typeof body !== 'object') {
      return {
        success: false,
        message: 'Invalid request body',
      };
    }
    
    const userId = body.userId || req?.user?.userId || 'anonymous';
    const position = body.position;
    
    // Валидация position
    if (typeof position !== 'number' || position < 0 || position > 8) {
      return {
        success: false,
        message: 'Invalid position. Must be between 0 and 8',
      };
    }

    // Получаем или создаем игру
    let game = this.games.get(userId);
    if (!game) {
      game = this.createNewGame();
      this.games.set(userId, game);
    }

    // Проверяем, что игра не закончена
    if (game.winner || game.isDraw) {
      return {
        success: false,
        message: 'Игра уже закончена',
        game,
      };
    }

    // Проверяем, что позиция свободна
    if (game.board[position] !== '') {
      return {
        success: false,
        message: 'Эта позиция уже занята',
        game,
      };
    }

    // Делаем ход игрока
    game.board[position] = game.currentPlayer;
    
    // Проверяем победу
    const winner = this.checkWinner(game.board);
    if (winner) {
      game.winner = winner;
      game.isDraw = false;
      
      if (this.eventBus && this.PLUGIN_EVENTS) {
        await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_DONE, {
          type: 'TIC_TAC_TOE_GAME_ENDED',
          userId,
          winner,
          board: game.board,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (this.isBoardFull(game.board)) {
      game.isDraw = true;
      game.winner = null;
      
      if (this.eventBus && this.PLUGIN_EVENTS) {
        await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_DONE, {
          type: 'TIC_TAC_TOE_GAME_ENDED',
          userId,
          winner: 'draw',
          board: game.board,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Переключаем игрока
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
      
      if (this.eventBus && this.PLUGIN_EVENTS) {
        await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_DONE, {
          type: 'TIC_TAC_TOE_MOVE_MADE',
          userId,
          position,
          player: game.currentPlayer === 'X' ? 'O' : 'X', // Тот, кто только что сделал ход
          board: game.board,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      data: {
        game,
        message: game.winner 
          ? `Победитель: ${game.winner}` 
          : game.isDraw 
          ? 'Ничья!' 
          : `Ход игрока: ${game.currentPlayer}`,
      },
    };
  }

  /**
   * Сбросить игру
   * POST /api/v2/plugins/tic-tac-toe/tic-tac-toe/reset
   */
  async resetGame(body: ResetGameDto, query: any, req: any) {
    const userId = body.userId || req?.user?.userId || 'anonymous';
    const playerSymbol = body.playerSymbol || 'X';

    const game = this.createNewGame();
    game.currentPlayer = playerSymbol;
    this.games.set(userId, game);

    if (this.eventBus && this.PLUGIN_EVENTS) {
      await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_DONE, {
        type: 'TIC_TAC_TOE_GAME_STARTED',
        userId,
        playerSymbol,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      data: {
        game,
        message: 'Игра сброшена',
      },
    };
  }

  /**
   * Получить статус игры
   * GET /api/v2/plugins/tic-tac-toe/tic-tac-toe/status
   */
  async getGameStatus(body: any, query: any, req: any) {
    const userId = query.userId || req?.user?.userId || 'anonymous';
    const game = this.games.get(userId);

    if (!game) {
      return {
        success: true,
        data: {
          game: null,
          message: 'Игра не начата',
        },
      };
    }

    return {
      success: true,
      data: {
        game,
        message: game.winner 
          ? `Победитель: ${game.winner}` 
          : game.isDraw 
          ? 'Ничья' 
          : `Ход игрока: ${game.currentPlayer}`,
      },
    };
  }

  /**
   * Создать новую игру
   */
  private createNewGame() {
    return {
      board: ['', '', '', '', '', '', '', '', ''],
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
      moves: 0,
    };
  }

  /**
   * Проверить победителя
   */
  private checkWinner(board: string[]): 'X' | 'O' | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
      [0, 4, 8], [2, 4, 6], // Диагональные
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as 'X' | 'O';
      }
    }

    return null;
  }

  /**
   * Проверить, заполнена ли доска
   */
  private isBoardFull(board: string[]): boolean {
    return board.every(cell => cell !== '');
  }
}
