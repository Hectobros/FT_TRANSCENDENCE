import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BannedChan, Channel, User } from 'db-interface/Core';
import { BannedChanService } from './banned-chan.service';
import { UserModule } from '../user/user.module';


@Module({
	imports: [UserModule, TypeOrmModule.forFeature([Channel, BannedChan, User])],
	providers: [BannedChanService],
	exports: [BannedChanService]
})
export class BannedChanModule {}
