import { IsDecimal, IsIn, IsOptional, IsUUID } from 'class-validator';

export class UpdateTradeDto {
  @IsUUID()
  signal_id: string;

  @IsIn(['OPENED', 'CLOSED', 'CANCELLED'])
  status: 'OPENED' | 'CLOSED' | 'CANCELLED';

  @IsOptional()
  @IsDecimal()
  price?: string;

  @IsOptional()
  @IsDecimal()
  pnl?: string;
}
