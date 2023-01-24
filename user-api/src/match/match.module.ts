import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockerBlocked, Match, User } from 'db-interface/Core';
import { UserService } from 'user-api/user.service';
import {JwtModule } from '@nestjs/jwt';
import { UserModule } from 'user-api/user.module';

@Module({
    imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET }), TypeOrmModule.forFeature([User, Match, BlockerBlocked])],
    controllers: [MatchController],
    providers: [MatchService, UserService],
    exports: [MatchService],
})
export class MatchModule { }
