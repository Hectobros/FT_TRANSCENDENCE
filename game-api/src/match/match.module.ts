import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 

import { MatchService } from './match.service';
import { MatchController } from './match.controller';

import {Match, UserMatch, User, UserStats } from 'db-interface/Core';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Match, UserMatch, User, UserStats])], 
  providers: [MatchService],
  controllers: [MatchController],
  exports: [MatchService],
})
export class MatchModule {}
