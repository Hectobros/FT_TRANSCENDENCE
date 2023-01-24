import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import {
  User,
  UserMatch,
  Match,
  Channel,
  UserChannel,
  UserStats,
  Message,
  Avatar,
  UserSettings,
  BannedChan,
  BlockerBlocked
} from 'db-interface/Core';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]),
	ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
	  entities: [
		            Avatar,
                Match,
                UserMatch,
                Channel,
                UserChannel,
                Message,
                UserStats,
                User,
                UserSettings,
                BannedChan,
                BlockerBlocked
	],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    MatchModule,
    GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
