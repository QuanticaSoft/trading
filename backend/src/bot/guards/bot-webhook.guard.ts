import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

// The Telegram bot is a trusted internal caller, not a public client.
// This guard is the only thing standing between /bot/* and the internet,
// so a missing or mismatched secret must always fail closed.
@Injectable()
export class BotWebhookGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-bot-webhook-secret');
    const expected = this.config.get<string>('BOT_WEBHOOK_SECRET');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid bot webhook secret');
    }
    return true;
  }
}
