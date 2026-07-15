import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { MetricsSnapshotDto } from './dto/metrics-snapshot.dto';
import { MetricsWebhookGuard } from './guards/metrics-webhook.guard';
import { MetricsCacheService } from './metrics-cache.service';

// Snapshots are transient: the metrics service can always recompute them
// from the signals table, so the backend just caches + rebroadcasts and
// does not persist them to Postgres.
@UseGuards(MetricsWebhookGuard)
@Controller('internal/metrics')
export class MetricsController {
  constructor(
    private readonly events: EventsGateway,
    private readonly cache: MetricsCacheService,
  ) {}

  @Post()
  publish(@Body() dto: MetricsSnapshotDto) {
    this.cache.set(dto);
    this.events.emitMetricsUpdated(dto);
    return { received: true };
  }
}
