import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import * as bcrypt from 'bcrypt';
import { Channel, ChannelType, Message, User } from 'db-interface/Core';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BlockerBlockedService } from '../blocker-blocked/blocker-blocked.service';

@Injectable()
export class ChannelService {

  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private blockerBlockedService: BlockerBlockedService

  ) { }

  private logger: Logger = new Logger('ChannelService');

  private saltOrRounds = 10;

  async create(createChannelDto: CreateChannelDto, user?: User) {
    const channel = new Channel();
    if (createChannelDto.name[0] == '#')
      throw new HttpException("Channel name can't begin with #", HttpStatus.FORBIDDEN);
    if (createChannelDto.name.length == 0)
      throw new HttpException("Channel name can't be empty", HttpStatus.FORBIDDEN);
    channel.name = createChannelDto.name;
    const same_named_channel = await this.channelsRepository.findOneBy({ name: channel.name });
    if (same_named_channel)
      throw new HttpException(`Another chan with the name ${createChannelDto.name} already exists`, HttpStatus.FAILED_DEPENDENCY);
    if (createChannelDto.password)
      channel.password = await bcrypt.hash(createChannelDto.password, this.saltOrRounds);
    if (createChannelDto.type)
      channel.type = createChannelDto.type
    if (user)
      channel.creator = user;

    return this.channelsRepository.save(channel);
  }

  async findAll() {
    return await this.channelsRepository.find({
      relations: { creator: true, userChannels: { user: true } }
    });
  }

  async findWithUserChan(id: number) {
    const found = await this.channelsRepository.find({
      where: { id: id },
      relations: { userChannels: { user: true } }
    });
    return found[0];
  }

  async findOne(id: number) {
    const channel = await this.channelsRepository.findOneBy({ id: id });
    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    else
      return channel;
  }

  async findChanWithCreator(id: number) {
    const channel = await this.channelsRepository.find({
      where: { id: id },
      relations: { creator: true, userChannels: { user: true } }
    })
    if (channel.length == 0)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    return channel[0];
  }

  async findMessages(id: number) {
    const channel = await this.channelsRepository.findOneBy({ id: id });
    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    return await this.messagesRepository.find(
      {
        relations: {
          channel: true,
          sender: true,
        },
        where: {
          channel: {
            id: id,
          },
        },
      })
  }

  async selectMessagesForUser(id: number, user: User) {
    const messages = await this.findMessages(id);
    let ret = [];
    for (let msg of messages) {
      const isblocked: boolean = await this.blockerBlockedService.isBlockedBy(msg.sender, user);
      if (!isblocked)
        ret.push(msg);
    }
    return ret;
  }

  async checkChanValidity(payload: JoinChannelDto) {
    const channel = await this.channelsRepository
      .createQueryBuilder("channel")
      .where("channel.id = :id", { id: payload.id })
      .addSelect("channel.password")
      .getOne();
    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    if (channel.type === ChannelType.protected) {
      if (!payload.password)
        throw new HttpException('Channel password is needed', HttpStatus.FORBIDDEN);
      const passwordMatch = bcrypt.compareSync(payload.password, channel.password);
      if (!passwordMatch)
        throw new HttpException('Channel password is wrong', HttpStatus.FORBIDDEN);
    }
    return channel
  }

  async findMessagesWithPassword(body: JoinChannelDto) {

    const channel = await this.channelsRepository
      .createQueryBuilder("channel")
      .where("channel.id = :id", { id: body.id })
      .addSelect("channel.password")
      .getOne();

    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    if (channel.password) {
      if (!body.password)
        throw new HttpException('Channel password is needed', HttpStatus.FORBIDDEN);

      const passwordMatch = bcrypt.compareSync(body.password, channel.password);
      if (!passwordMatch)
        throw new HttpException('Channel password is wrong', HttpStatus.FORBIDDEN);
    }

    return await this.messagesRepository.find({
      relations: {
        channel: true,
        sender: true,
      },
      where: {
        channel: {
          id: body.id,
        },
      },
    })
  }

  async update(updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelsRepository
      .createQueryBuilder("channel")
      .where("channel.id = :id", { id: updateChannelDto.id })
      .addSelect("channel.password")
      .getOne();
    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    if (updateChannelDto.type) {
      if (!updateChannelDto.password && updateChannelDto.type == ChannelType.protected) {
        throw new HttpException('A password is needed to set protected channels', HttpStatus.FORBIDDEN);
        return;
      }
      channel.type = updateChannelDto.type;
    }
    if (updateChannelDto.password) {
      channel.type = ChannelType.protected;
      channel.password = await bcrypt.hash(updateChannelDto.password, this.saltOrRounds);
    }
    if (channel.type != ChannelType.protected)
      channel.password = null;
    await this.channelsRepository.save(channel);

  }

  chanAllowedUsers(channel: Channel, sender?: User): User[] {
    let arr: User[];
    for (let user_channel of channel.userChannels) {
      let user: User = user_channel.user;
      // if(user IS NOT MUTE BY CHANNEL AND NOT BLOCKED BY SENDER)
      arr.push(user);
    }
    return arr;
  }

  async remove(id: number) {
    const channel = await this.channelsRepository.findOneBy({ id: id })
    if (!channel)
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    else if (channel.unremovable == false)
      await this.channelsRepository.delete(id);
    else
      throw new HttpException('Forbidden: unremovable channel', HttpStatus.FORBIDDEN);
  }


  async findDMChannel(senderId: number, receiverId: number) {
    const chans = await this.channelsRepository.find(
      {
        relations: { userOne: true, userTwo: true },
        where: [
          {
            userOne: { id: senderId },
            userTwo: { id: receiverId }
          },
          {
            userOne: { id: receiverId },
            userTwo: { id: senderId }
          },
        ]
      })
    return chans;
  }

  async createDMChannel(userOne: User, userTwo: User) {
    const channel = new Channel();
    channel.name = `#${userOne.login}-${userTwo.login}`
    channel.type = ChannelType.direct
    channel.userOne = userOne;
    channel.userTwo = userTwo;
    return this.channelsRepository.save(channel);
  }
}
