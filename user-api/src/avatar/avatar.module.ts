import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { UserService } from 'user-api/user.service';
import { AvatarController } from './avatar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar, BlockerBlocked, User, UserStats } from 'db-interface/Core';
import {JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }), TypeOrmModule.forFeature([User, UserStats, Avatar, BlockerBlocked])],
    controllers: [AvatarController],
    providers: [AvatarService, UserService],
})
export class AvatarModule { }
