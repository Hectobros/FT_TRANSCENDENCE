import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import {JwtModule } from '@nestjs/jwt';

import { UserService } from './user.service';

import {Match, UserMatch, User, UserStats } from 'db-interface/Core';

@Module({
  imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }), TypeOrmModule.forFeature([Match, UserMatch, User, UserStats])], 
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
