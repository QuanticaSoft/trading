import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { Signal } from './entities/signal.entity';
import { CreateSignalDto } from '../bot/dto/create-signal.dto';
import { UpdateTradeDto } from '../bot/dto/update-trade.dto';

describe('SignalsService', () => {
  let service: SignalsService;
  const repo = {
    create: jest.fn((data: Partial<Signal>) => data),
    save: jest.fn((data: Partial<Signal>) => Promise.resolve(data)),
    findOneBy: jest.fn(),
    count: jest.fn(() => Promise.resolve(0)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        { provide: getRepositoryToken(Signal), useValue: repo },
      ],
    }).compile();
    service = module.get(SignalsService);
  });

  it('creates a signal from the bot payload with PENDING status', async () => {
    const dto: CreateSignalDto = {
      signal_id: '11111111-1111-1111-1111-111111111111',
      symbol: 'EURUSD',
      side: 'BUY',
      entry: '1.0850',
    };

    const result = await service.createFromBot(dto);

    expect(result.status).toBe('PENDING');
    expect(result.id).toBe(dto.signal_id);
    expect(repo.save).toHaveBeenCalled();
  });

  it('throws NotFoundException when updating a trade for an unknown signal', async () => {
    repo.findOneBy.mockResolvedValue(null);
    const dto: UpdateTradeDto = { signal_id: 'missing', status: 'OPENED' };

    await expect(service.applyTradeUpdate(dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('applies a trade update to an existing signal', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'abc', status: 'PENDING' });
    const dto: UpdateTradeDto = {
      signal_id: 'abc',
      status: 'OPENED',
      price: '1.0851',
    };

    const result = await service.applyTradeUpdate(dto);

    expect(result.status).toBe('OPENED');
    expect(result.executionPrice).toBe('1.0851');
  });

  it('summarizes counts by status', async () => {
    repo.count.mockImplementation((opts?: { where: { status: string } }) =>
      Promise.resolve(opts?.where.status === 'OPENED' ? 2 : 0),
    );

    const summary = await service.statusSummary();

    expect(summary).toEqual({
      PENDING: 0,
      OPENED: 2,
      CLOSED: 0,
      CANCELLED: 0,
    });
  });
});
