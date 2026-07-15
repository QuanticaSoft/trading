import {
  IsArray,
  IsDecimal,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSignalDto {
  @IsUUID()
  signal_id: string;

  @IsString()
  @MaxLength(15)
  symbol: string;

  @IsIn(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @IsDecimal()
  entry: string;

  @IsOptional()
  @IsDecimal()
  stop_loss?: string;

  @IsOptional()
  @IsArray()
  @IsDecimal({}, { each: true })
  take_profit?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
