import { Module } from '@nestjs/common';
import { UserService } from './user.service';

import {JwtModule } from '@nestjs/jwt';

import { TypeOrmModule } from '@nestjs/typeorm'; 
import { User } from 'db-interface/Core';

@Module({
  imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }), TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
