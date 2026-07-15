import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MetricsController } from './metrics.controller';
import { MetricsWebhookGuard } from './guards/metrics-webhook.guard';

@Module({
  imports: [EventsModule],
  controllers: [MetricsController],
  providers: [MetricsWebhookGuard],
})
export class MetricsModule {}
