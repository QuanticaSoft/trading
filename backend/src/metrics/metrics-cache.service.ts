import { Injectable } from '@nestjs/common';
import { MetricsSnapshotDto } from './dto/metrics-snapshot.dto';

// Holds only the most recent snapshot, in memory. It is a cache of a value
// the metrics service can always recompute from `signals` — not a source
// of truth, so it does not need to survive a restart.
@Injectable()
export class MetricsCacheService {
  private latest: MetricsSnapshotDto | null = null;

  set(snapshot: MetricsSnapshotDto): void {
    this.latest = snapshot;
  }

  get(): MetricsSnapshotDto | null {
    return this.latest;
  }
}
