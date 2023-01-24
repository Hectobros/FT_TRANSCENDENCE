import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, User } from 'db-interface/Core';
import { MatchStatus } from 'db-interface/Core';
import { Repository } from 'typeorm';
import { QueryFilterDto } from 'validation/query.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Equal } from 'typeorm';

@Injectable()
export class MatchService 
{
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
    ) { }

    async listByUserID(login: string, query: QueryFilterDto): Promise<Match[]> {
        return this.matchRepository.find({
            skip: query.onset,
            take: query.length,
            where: { participants: Equal(login) },
            relations: {
                participants: true,
            },
        });
    }

    async findCurrentUnfinishedMatchesByUser(userOne: User) {
		const matches = await this.matchRepository.find(
			{
				relations: { playerOne: true, playerTwo: true },
				where: [
					//p1 =u1
					{
						playerOne: { id: userOne.id },
						status: MatchStatus.pending
					},
					{
						playerOne: { id: userOne.id },
						status: MatchStatus.requested
					},
					//p2 = u1
					{
						// useless condition
						playerTwo: { id: userOne.id },
						status: MatchStatus.pending
					},
					{
						playerTwo: { id: userOne.id },
						status: MatchStatus.requested
					},
				]
			})
		return matches;
	}

    async remove(id: number) 
    {
		const match = await this.matchRepository.findOneBy({ id: id })
		if (!match)
			return;
		await this.matchRepository.delete(match.id);
	}

	async removeByGameCode(gameCode: string) {
		const match = await this.matchRepository.findOneBy({ gameCode: gameCode })
		if (!match)
			return;
		await this.matchRepository.delete(match.id);
	}

	async findByGameCode(gameCode: string) {
		const match = await this.matchRepository.findOneBy({ gameCode: gameCode })
		if (!match)
			throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
		return match;
	}


    
}
