import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus, User } from 'db-interface/Core';
import { Logger } from '@nestjs/common';
import { UserService } from './user/user.service';
import { MatchService } from './match/match.service';

@Injectable()
export class AppService {

  constructor(
    private userService: UserService,
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    private matchService: MatchService) {}

  private logger: Logger = new Logger('onApplicationBootstrap');

  async createMatch(status: MatchStatus) {

      const logins = ['myoyo', 'pmartinezi', 'gbaltring', 'malik'];
      let login1 = logins[Math.floor(Math.random() * logins.length)];
      let login2 = logins[Math.floor(Math.random() * logins.length)];
      while (login2 == login1)
        login2 = logins[Math.floor(Math.random() * logins.length)];
      const playerOne = await this.userService.getUserByLogin(login1);
      const playerTwo = await this.userService.getUserByLogin(login2);
      const gameCode = await this.matchService.generateGameCode();
      let match = await this.matchesRepository.findOneBy({ gameCode: gameCode })
      if (!match) {
        const match = new Match();
        match.playerOne = playerOne;
        match.playerTwo = playerTwo;
        match.gameCode = gameCode;
        match.finishedAt = new Date(Date.now());
        match.status = status;
        this.matchesRepository.save(match);
        this.logger.log(`Creation of seed macth ${match.gameCode}`);
      }
  }

  async removeUnfinishedMatches() {
    const allUnfinishedMatches = await this.matchService.findAllUnfinieshedMatches()
    for (let match of allUnfinishedMatches) {
      this.matchService.remove(match.id);
    }
  }

  async onApplicationBootstrap() {
    
    try {
      this.removeUnfinishedMatches();

      // for (let i =0 ; i <= 10; i++)
      //   await this.createMatch(MatchStatus.live);
    
    } catch (error) { }
  }

}
