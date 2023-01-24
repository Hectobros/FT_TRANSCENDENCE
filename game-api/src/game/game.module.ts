import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 

import { UserModule } from '../user/user.module';
import { MatchModule } from '../match/match.module';
import { UserMatchModule } from '../user-match/user-match.module';

import { GameService } from './game.service';
import { User } from 'db-interface/Core';
import { GameGateway } from './game.gateway';

@Module({
	imports: [MatchModule, UserModule, UserMatchModule, TypeOrmModule.forFeature([User])],
	providers: [GameService, GameGateway],
	exports: [GameService],
})
export class GameModule {
}
