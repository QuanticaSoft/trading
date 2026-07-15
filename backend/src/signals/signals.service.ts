import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signal, SignalStatus } from './entities/signal.entity';
import { CreateSignalDto } from '../bot/dto/create-signal.dto';
import { UpdateTradeDto } from '../bot/dto/update-trade.dto';

const ALL_STATUSES: SignalStatus[] = [
  'PENDING',
  'OPENED',
  'CLOSED',
  'CANCELLED',
];

@Injectable()
export class SignalsService {
  constructor(
    @InjectRepository(Signal) private readonly repo: Repository<Signal>,
  ) {}

  async createFromBot(dto: CreateSignalDto): Promise<Signal> {
    const signal = this.repo.create({
      id: dto.signal_id,
      symbol: dto.symbol,
      side: dto.side,
      entry: dto.entry,
      stopLoss: dto.stop_loss ?? null,
      takeProfit: dto.take_profit ?? [],
      source: dto.source ?? null,
      status: 'PENDING',
    });
    return this.repo.save(signal);
  }

  async applyTradeUpdate(dto: UpdateTradeDto): Promise<Signal> {
    const signal = await this.repo.findOneBy({ id: dto.signal_id });
    if (!signal) {
      throw new NotFoundException(`Signal ${dto.signal_id} not found`);
    }

    signal.status = dto.status;
    if (dto.price !== undefined) signal.executionPrice = dto.price;
    if (dto.pnl !== undefined) signal.pnl = dto.pnl;

    return this.repo.save(signal);
  }

  async findOne(id: string): Promise<Signal | null> {
    return this.repo.findOneBy({ id });
  }

  async findRecent(limit: number): Promise<Signal[]> {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  async statusSummary(): Promise<Record<SignalStatus, number>> {
    const counts = await Promise.all(
      ALL_STATUSES.map((status) => this.repo.count({ where: { status } })),
    );
    return Object.fromEntries(
      ALL_STATUSES.map((status, i) => [status, counts[i]]),
    ) as Record<SignalStatus, number>;
  }
}
