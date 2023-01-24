import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 

import { UserMatchService } from './user-match.service';

import {Match, UserMatch, User } from 'db-interface/Core';


@Module({
  imports: [TypeOrmModule.forFeature([Match, UserMatch, User])], 
  providers: [UserMatchService],
  exports: [UserMatchService]
})
export class UserMatchModule {}
