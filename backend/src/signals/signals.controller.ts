import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SignalsService } from './signals.service';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

// Public, read-only, unauthenticated in v1 (decision: this terminal is
// meant to run on a private network, not exposed to the internet — see
// .claude/goal.md). Never put write operations behind this controller.
@Controller('signals')
export class SignalsController {
  constructor(private readonly signals: SignalsService) {}

  @Get()
  async list(
    @Query('limit', new DefaultValuePipe(DEFAULT_LIMIT), ParseIntPipe)
    limit: number,
  ) {
    return this.signals.findRecent(Math.min(limit, MAX_LIMIT));
  }
}
