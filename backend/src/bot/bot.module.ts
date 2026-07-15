import { Module } from '@nestjs/common';
import { SignalsModule } from '../signals/signals.module';
import { EventsModule } from '../events/events.module';
import { BotController } from './bot.controller';
import { BotWebhookGuard } from './guards/bot-webhook.guard';

@Module({
  imports: [SignalsModule, EventsModule],
  controllers: [BotController],
  providers: [BotWebhookGuard],
})
export class BotModule {}
