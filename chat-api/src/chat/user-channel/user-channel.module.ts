import { Module } from '@nestjs/common';
import { UserChannelService } from './user-channel.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserChannel, Channel, User } from 'db-interface/Core';

@Module({
  imports: [TypeOrmModule.forFeature([UserChannel, Channel, User])], 
  providers: [UserChannelService],
  exports: [UserChannelService]
})
export class UserChannelModule {}
