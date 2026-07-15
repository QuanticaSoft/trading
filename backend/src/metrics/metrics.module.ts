import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MetricsController } from './metrics.controller';
import { PublicMetricsController } from './public-metrics.controller';
import { MetricsWebhookGuard } from './guards/metrics-webhook.guard';
import { MetricsCacheService } from './metrics-cache.service';

@Module({
  imports: [EventsModule],
  controllers: [MetricsController, PublicMetricsController],
  providers: [MetricsWebhookGuard, MetricsCacheService],
})
export class MetricsModule {}
