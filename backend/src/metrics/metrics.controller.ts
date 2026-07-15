import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { MetricsSnapshotDto } from './dto/metrics-snapshot.dto';
import { MetricsWebhookGuard } from './guards/metrics-webhook.guard';

// Snapshots are transient: the metrics service can always recompute them
// from the signals table, so the backend just rebroadcasts and does not
// persist them.
@UseGuards(MetricsWebhookGuard)
@Controller('internal/metrics')
export class MetricsController {
  constructor(private readonly events: EventsGateway) {}

  @Post()
  publish(@Body() dto: MetricsSnapshotDto) {
    this.events.emitMetricsUpdated(dto);
    return { received: true };
  }
}
