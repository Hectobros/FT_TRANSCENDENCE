import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Avatar, User } from 'db-interface/Core';
import { Repository } from 'typeorm';
import { QueryFilterDto } from 'validation/query.dto';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private avatarRepository: Repository<Avatar>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async list(login: string, query: QueryFilterDto): Promise<Avatar[]> {
    return this.avatarRepository.find({
      skip: query.onset,
      take: query.length,
      where: { user: { login: login } },
    });
  }

  async deleteByID(login: string, avatarID: number): Promise<void> {
    this.avatarRepository.delete({ user: { login: login }, id: avatarID });
  }

  async create(user: User, fileName: string): Promise<Avatar> {
	user.avatar.path = `http://${process.env.VUE_APP_IP}:3003/upload/${fileName}`;
    return this.userRepository.save(user).then((value: User) => value.avatar);
  }
}
