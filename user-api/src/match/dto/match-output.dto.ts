import { InternalServerErrorException } from '@nestjs/common';
import { UserMatch, Match, UserMatchRole } from 'db-interface/Core';
import { UserOutputDto } from 'user-api/dto/user-output.dto';

export class UserMatchOutputDto {
    user: UserOutputDto;
    score: number;

    constructor(user: UserMatch) {
        this.user = new UserOutputDto(user.user);
        this.score = user.score;
    }
}

export class MatchOutputDto {
    id: number;
    finished_at: Date;
    winner: UserMatchOutputDto;
    looser: UserMatchOutputDto;

    constructor(match: Match) {
        this.id = match.id;
        this.finished_at = match.finishedAt;
        this.winner = new UserMatchOutputDto(this.findWinner(match.participants));
        this.looser = new UserMatchOutputDto(this.findLooser(match.participants));
    }

    findWinner(participants: UserMatch[]): UserMatch {
        let tmp: UserMatch[] = participants.map((val: UserMatch) => {
            switch (val.role) {
                case (UserMatchRole.player_one, UserMatchRole.player_two): {
                    return val;
                }
                default: {
                    return undefined;
                }
            }
        });

        if (tmp.length != 2) {
            throw new InternalServerErrorException(
                'more than 2 players detected for a match',
            );
        }

        return tmp[0].score > tmp[1].score ? tmp[0] : tmp[1];
    }

    findLooser(participants: UserMatch[]): UserMatch {
        let tmp: UserMatch[] = participants.map((val: UserMatch) => {
            switch (val.role) {
                case (UserMatchRole.player_one, UserMatchRole.player_two): {
                    return val;
                }
                default: {
                    return undefined;
                }
            }
        });

        if (tmp.length != 2) {
            throw new InternalServerErrorException(
                'more than 2 players detected for a match',
            );
        }

        return tmp[0].score < tmp[1].score ? tmp[0] : tmp[1];
    }
}
