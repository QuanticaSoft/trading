import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

// Own secret, separate from BOT_WEBHOOK_SECRET, so a leak of one caller's
// credential doesn't grant access to the other's endpoints.
@Injectable()
export class MetricsWebhookGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-metrics-webhook-secret');
    const expected = this.config.get<string>('METRICS_WEBHOOK_SECRET');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid metrics webhook secret');
    }
    return true;
  }
}
