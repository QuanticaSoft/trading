import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotWebhookGuard } from './bot-webhook.guard';

function mockContext(headerValue?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ header: () => headerValue }),
    }),
  } as unknown as ExecutionContext;
}

describe('BotWebhookGuard', () => {
  const config = {
    get: () => 'expected-secret',
  } as unknown as ConfigService;

  it('allows requests carrying the correct secret', () => {
    const guard = new BotWebhookGuard(config);
    expect(guard.canActivate(mockContext('expected-secret'))).toBe(true);
  });

  it('rejects requests with a wrong secret', () => {
    const guard = new BotWebhookGuard(config);
    expect(() => guard.canActivate(mockContext('wrong'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects requests with no secret header', () => {
    const guard = new BotWebhookGuard(config);
    expect(() => guard.canActivate(mockContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
