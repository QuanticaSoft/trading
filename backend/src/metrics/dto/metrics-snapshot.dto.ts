import {
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class MetricsSnapshotDto {
  @IsISO8601()
  generated_at: string;

  @IsInt()
  @Min(0)
  closed_trades: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  win_rate?: number | null;

  @IsNumber()
  total_pnl: number;

  @IsOptional()
  @IsNumber()
  average_pnl?: number | null;

  @IsNumber()
  @Min(0)
  max_drawdown: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  profit_factor?: number | null;
}
