import { Controller, Get } from '@nestjs/common';
import { MetricsCacheService } from './metrics-cache.service';

// Public, read-only, unauthenticated in v1 — same trust boundary decision
// as SignalsController.
@Controller('metrics')
export class PublicMetricsController {
  constructor(private readonly cache: MetricsCacheService) {}

  @Get('latest')
  latest() {
    return this.cache.get();
  }
}
