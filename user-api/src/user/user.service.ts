import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Avatar, UserStatus, BlockerBlocked, UserSettings, UserStats } from 'db-interface/Core';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { QueryFilterDto } from 'validation/query.dto';

import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IToken } from './interface/token.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BlockerBlocked)
    private blockerBlockedRepository: Repository<BlockerBlocked>,
    private readonly jwtService: JwtService
  ) { }

  private logger: Logger = new Logger('UserService');

  async create(login: string, avatarPath: string): Promise<User> {
    let user = new User(login);
    let username = login;
    let id = 1;
    let sameUsername = await this.userRepository.find({where:{ userName: username }});
    while (sameUsername.length != 0)
    {
      username = `${login}_${id}`;
      sameUsername = await this.userRepository.find({where:{ userName: username }});
      id++;
    }
    user.userName = username
    user.avatar = new Avatar(avatarPath);
    user.settings = new UserSettings;
    user.stats = new UserStats;
    return this.userRepository.save(user);
  }

  list(query: QueryFilterDto): Promise<User[]> {
    return this.userRepository.find({
      skip: query.onset,
      take: query.length,
      where: query.search
        ? {
          userName: Like(`%${query.search}%`),
        }
        : undefined,
      relations: {
        stats: true,
      },
    });
  }

  findOne(login: string): Promise<User> {
    return this.userRepository.findOneBy({ login: login });
  }

  findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOneBy({ userName: username });
  }

  updateOne(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    user.userName = updateUserDto.username
      ? updateUserDto.username
      : user.userName;
    
    user.twoFa = updateUserDto.twoFa;

    // user.settings.twoFa = updateUserDto.settings
    // ? updateUserDto.settings.two_fa
    // : user.settings.twoFa;

    user.settings.mapId = updateUserDto.settings
      ? updateUserDto.settings.map_id
      : user.settings.mapId;
  
    user.settings.paddleId = updateUserDto.settings
      ? updateUserDto.settings.paddle_id
      : user.settings.paddleId;

    return this.userRepository.save(user);
  }

  removeByLogin(login: string): Promise<DeleteResult> {
    return this.userRepository.delete({ login: login });
  }

  async findFriends(userLogin: string, query: QueryFilterDto): Promise<User[]> {
    let users: User[] = await this.userRepository.find({
      where: {
        login: userLogin,
      },
      relations: {
        friends: true,
      },
    });
    let user = users[0];
    let friends: User[] = user.friends.slice(query.onset, query.length);
    if (query.search) {
      return friends.filter((value: User) =>
        value.login.includes(query.search) ? value : undefined,
      );
    }
    return friends;
  }

  async addFriends(userLogin: string, friendLogin: string): Promise<void> {
    const userOne = await this.findOne(userLogin);
    const userTwo = await this.findOne(friendLogin);
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'friends')
      .of(userOne)
      .add(userTwo);
  }

  async removeFriends(userLogin: string, friendLogin: string): Promise<void> {
    const userOne = await this.findOne(userLogin);
    const userTwo = await this.findOne(friendLogin);
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'friends')
      .of(userOne)
      .remove(userTwo);
  }

  checkToken(token: any)
  {
	if (typeof token != "string")
		throw new HttpException(`Invalid token type`, HttpStatus.FORBIDDEN);
		let validated;
		try {
			validated = this.jwtService.verify(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}
	  if (!validated)
		  throw new HttpException(`Invalid token`, HttpStatus.FORBIDDEN);
	  return validated;
  }

  async getUserByToken(token: string) {
    const decoded = this.jwtService.decode(token) as IToken;
    const user = await this.userRepository.findOneBy({ login: decoded.login });
    if (!user)
      throw new HttpException(`User ${decoded.login} not found`, HttpStatus.NOT_FOUND);
    return user
  }

  async updateUserStatus(user: User, status: UserStatus, socketId?: string) {
    user.globalSocketId = socketId || user.globalSocketId;
    user.status = status;
    this.userRepository.save(user);
  }

  async getUserBySocketId(socket: string) {
    const user = await this.userRepository
      .createQueryBuilder()
      .select("user")
      .from(User, "user")
      .where("user.globalSocketId = :socketId", { socketId: socket })
      .getOne();
    if (!user)
      throw new HttpException(`User with global socket #${socket} not found`, HttpStatus.NOT_FOUND);
    return user;
  }


  // ------BLOCKED_USERS UTILITARIES---------------------------

  async findBlockedsByLogin(userLogin: string, blockedLogin: string): Promise<User[]> {
    let blockedUsers: User[] = [];
    let blockerBlockeds = await this.blockerBlockedRepository.find(
      {
        relations: {
          blocked: true,
          blocker: true
        },
        where: {
          blocker: {
            login: userLogin,
          },
          blocked: {
            login: blockedLogin,
          }
        },
      })
    if (blockerBlockeds.length != 0) {
      for (let bb of blockerBlockeds) {
        blockedUsers.push(bb.blocked);
      }
    }
    return blockedUsers;
  }


  async findBlockeds(userLogin: string): Promise<User[]> {
    const user: User = await this.userRepository.findOneBy({ login: userLogin })

    let blockedUsers: User[] = [];
    let blockerBlockeds = await this.blockerBlockedRepository.find(
      {
        relations: {
          blocked: true,
          blocker: true
        },
        where: {
          blocker: {
            id: user.id,
          },
        },
      })
    if (blockerBlockeds.length != 0) {
      for (let bb of blockerBlockeds) {
        blockedUsers.push(bb.blocked);
      }
    }
    return blockedUsers;
  }

  async addBlockeds(userLogin: string, blockedLogin: string): Promise<void> {
    const userOne: User = await this.findOne(userLogin);
    const userTwo: User = await this.findOne(blockedLogin);

    const toFind = await this.blockerBlockedRepository.find(
      {
        relations: {
          blocked: true,
          blocker: true
        },
        where: {
          blocker: {
            id: userOne.id,
          },
          blocked: {
            id: userTwo.id,
          },
        },
      })
    if (toFind.length)
      return;
    let bb = new BlockerBlocked;
    bb.blocker = userOne;
    bb.blocked = userTwo;
    await this.blockerBlockedRepository.save(bb);
  }

  async removeBlockeds(userLogin: string, friendLogin: string): Promise<void> {
    const userOne = await this.findOne(userLogin);
    const userTwo = await this.findOne(friendLogin);
    const toFind = await this.blockerBlockedRepository.find(
      {
        relations: {
          blocked: true,
          blocker: true
        },
        where: {
          blocker: {
            id: userOne.id,
          },
          blocked: {
            id: userTwo.id,
          },
        },
      })
    if (toFind.length == 0)
      return;
    this.blockerBlockedRepository.delete(toFind[0].id);
  }

  updateTwoFaCode(user: User, code: string)
  {
	user.twoFaCode = code;
	this.userRepository.save(user);
  }

  //------------------------invitation

  async getUserByLogin(login: string) {
    const user = await this.userRepository.findOneBy({ login: login });
    if (!user)
      throw new HttpException(`User ${login} not found`, HttpStatus.NOT_FOUND);
    return user
  }

}
