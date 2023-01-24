import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
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

@Module({
  imports: [
	TypeOrmModule.forFeature([Channel, User, Avatar]),
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
    ChatModule,
  ],
  providers: [AppService],
})
export class AppModule {}


