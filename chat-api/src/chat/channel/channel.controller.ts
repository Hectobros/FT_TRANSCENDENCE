import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { DirectMessageDtoControllerVersion } from './dto/direct-message.dto';
import { UserService } from '../user/user.service';
import { UserChannelService } from '../user-channel/user-channel.service';
import { CreateUserChannelDto } from '../user-channel/dto/create-user-channel.dto';
import { UserChannelRole } from 'db-interface/Core';
import { BlockerBlockedService } from '../blocker-blocked/blocker-blocked.service';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private userChannelService: UserChannelService,
    private blockerBlockedService: BlockerBlockedService

  ) { }

  // @Post()
  // create(@Body() createChannelDto: CreateChannelDto) {
  //   return this.channelService.create(createChannelDto);
  // }

  // @Get()
  // async getMessageWithBody(@Body() body: JoinChannelDto) 
  // {
  //   return this.channelService.findMessagesWithPassword(body);
  // }

  // @Get()
  // async getAllChannels() {
  //   // return this.channelService.findMessagesWithPassword(body);
  //   return this.channelService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const chan = this.channelService.findOne(+id);
  //   if (chan)
  //     return chan
  // }

  // @Get(':id/messages')
  // async getMessages(@Param('id') id: string) {
  //   return this.channelService.findMessages(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
  //   return this.channelService.update(+id, updateChannelDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   const chan = this.channelService.findOne(+id);
  //   if (chan)
  //     return this.channelService.remove(+id);
  // }


  @Post('direct_message')
  async createDM(@Body() dto: DirectMessageDtoControllerVersion) {
    await this.userService.checkToken(dto.token);
    const userOne = await this.userService.getUserByToken(dto.token);
    const userTwo = await this.userService.getUserByLogin(dto.login);

    const isblocked: boolean = await this.blockerBlockedService.isBlockedBy(userOne, userTwo);
    if (isblocked)
      throw new HttpException(`You can't send a direct-message to ${userTwo.login} because you are blocked by him.`, HttpStatus.FORBIDDEN);

    const DMChannels = await this.channelService.findDMChannel(userOne.id, userTwo.id);
    if (DMChannels.length)
      return (DMChannels[0]);
    else {
      const chan = await this.channelService.createDMChannel(userOne, userTwo);
      const userChannelData: CreateUserChannelDto =
      {
        userId: userOne.id,
        channelId: chan.id
      }
      await this.userChannelService.create(userChannelData, UserChannelRole.member);
      userChannelData.userId = userTwo.id;
      await this.userChannelService.create(userChannelData, UserChannelRole.member);
      return chan;
    }
  }
}
