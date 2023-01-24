import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ChannelGateway } from './channel.gateway';
import { UserModule } from '../user/user.module'; 
import { Channel, Message, User } from 'db-interface/Core';
import { UserChannelModule } from '../user-channel/user-channel.module';
import { BannedChanModule } from '../banned-chan/banned-chan.module';
import { BlockerBlockedModule } from '../blocker-blocked/blocker-blocked.module';

@Module({
  imports: [BlockerBlockedModule, BannedChanModule, UserModule, UserChannelModule, TypeOrmModule.forFeature([Channel, Message, User])],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService]
})
export class ChannelModule {}
