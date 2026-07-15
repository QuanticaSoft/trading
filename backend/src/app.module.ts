import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalsModule } from './signals/signals.module';
import { EventsModule } from './events/events.module';
import { BotModule } from './bot/bot.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'trading'),
        autoLoadEntities: true,
        // TODO: switch to migrations before production; synchronize is a
        // dev convenience that can silently alter/drop columns.
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    SignalsModule,
    EventsModule,
    BotModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
