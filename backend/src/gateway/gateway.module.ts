import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

/**
 * GatewayModule — модуль API‑шлюза.
 *
 * ВАЖНО: этот модуль должен импортироваться В КОНЦЕ списка imports в AppModule,
 * чтобы его catch-all контроллер срабатывал только как fallback,
 * когда ни один другой контроллер не обработал запрос.
 */
@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class GatewayModule {}


