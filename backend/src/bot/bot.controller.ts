import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SignalsService } from '../signals/signals.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { BotWebhookGuard } from './guards/bot-webhook.guard';

// Internal webhook consumed only by the Telegram bot — never expose this
// prefix to the public internet without the BotWebhookGuard in front.
@UseGuards(BotWebhookGuard)
@Controller('bot')
export class BotController {
  constructor(
    private readonly signals: SignalsService,
    private readonly events: EventsGateway,
  ) {}

  @Post('signals')
  async createSignal(@Body() dto: CreateSignalDto) {
    const signal = await this.signals.createFromBot(dto);
    this.events.emitSignalCreated(signal);
    return signal;
  }

  @Post('trades')
  async updateTrade(@Body() dto: UpdateTradeDto) {
    const signal = await this.signals.applyTradeUpdate(dto);
    this.events.emitSignalUpdated(signal);
    return signal;
  }

  @Get('status')
  async status(@Query('signal_id') signalId?: string) {
    if (signalId) {
      const signal = await this.signals.findOne(signalId);
      return signal ?? { error: 'not_found' };
    }
    return this.signals.statusSummary();
  }
}
