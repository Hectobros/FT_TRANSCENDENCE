import { InternalServerErrorException } from '@nestjs/common';
import {
  Avatar,
  User,
  UserSettings,
  UserStats,
  UserStatus,
  MapID,
  PaddleID,
} from 'db-interface/Core';

class UserStatsOutputDto {
  constructor(stats: UserStats) {
    this.id = stats.id;
    this.level = stats.level;
    this.defeats = stats.defeats;
    this.victories = stats.victories;
  }
  id: number;
  level: number;
  victories: number;
  defeats: number;
}

class SettingsOutputDto {
  twoFa: boolean;
  map_id: MapID;
  paddle_id: PaddleID;

  constructor(settings: UserSettings) {
    this.paddle_id = settings.paddleId;
    this.twoFa = settings.twoFa;
    this.map_id = settings.mapId;
  }
}

class ActualAvatarOutputDto {
  constructor(avatar: Avatar) {
    this.id = avatar.id;
    this.path = avatar.path;
  }
  id: number;
  path: string;
}

export class UserOutputDto {
  constructor(user: User) {
    this.stats = new UserStatsOutputDto(user.stats);
    this.login = user.login;
    this.twoFa = user.twoFa;
    this.username = user.userName;
    this.settings = new SettingsOutputDto(user.settings);
    this.actual_avatar = new ActualAvatarOutputDto(user.avatar);
    this.status = user.status;
  }
  login: string;
  actual_avatar: ActualAvatarOutputDto;
  username: string;
  twoFa: boolean;
  settings: SettingsOutputDto;
  stats: UserStatsOutputDto;
  status: UserStatus;
}
