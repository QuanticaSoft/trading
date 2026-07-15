import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signal } from './entities/signal.entity';
import { SignalsService } from './signals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Signal])],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}
