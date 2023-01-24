import { Module } from '@nestjs/common';
import { UserModule } from 'user-api/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { AvatarModule } from './avatar/avatar.module';
import { MatchModule } from './match/match.module';
import { MailModule } from './mail/mail.module';
import { TwoFaModule } from './two-fa/two-fa.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    UserModule,
    AvatarModule,
    MatchModule,
	StreamModule,
	TwoFaModule,
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
      synchronize: true,
    }),
  ],
  providers: [],
})
export class AppModule {}


