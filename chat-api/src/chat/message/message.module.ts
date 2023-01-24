import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageGateway } from './message.gateway';
import {Channel,Message,User} from 'db-interface/Core';
import { UserModule } from '../user/user.module'; 
import { ChannelModule } from '../channel/channel.module';
import { UserChannelModule } from '../user-channel/user-channel.module';
import { BannedChanModule } from '../banned-chan/banned-chan.module';
import { BlockerBlockedModule } from '../blocker-blocked/blocker-blocked.module';

@Module({
  imports: [BlockerBlockedModule, BannedChanModule, UserChannelModule, ChannelModule, UserModule, TypeOrmModule.forFeature([Message, Channel, User])],
  // controllers: [MessageController],
  providers: [MessageService, MessageGateway]
})
export class MessageModule {}
