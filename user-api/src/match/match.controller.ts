import {
    Controller,
    UseGuards,
    UseInterceptors,
    Get,
    NotFoundException,
    InternalServerErrorException,
    Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoggingInterceptor } from 'src/auth/auth.interceptor';
import { UserService } from 'user-api/user.service';
import { Identity } from 'user-api/user.decorator';
import { QueryFilterDto } from 'validation/query.dto';
import { User, Match } from 'db-interface/Core';
import { MatchOutputDto } from './dto/match-output.dto';
import { MatchService } from './match.service';

@Controller('api/users/me/match_history')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class MatchController {
    constructor(
        private readonly userService: UserService,
        private readonly matchService: MatchService,
    ) { }

    @Get()
    async listUserMatchHistory(
        @Identity() user: Identity,
        @Query() query: QueryFilterDto,
    ): Promise<MatchOutputDto[]> {
        const userFound: User | undefined = await this.userService.findOne(
            user.login,
        );
        if (!userFound) {
            throw new NotFoundException(`user ${user.login} not found`);
        }
        return this.matchService
            .listByUserID(user.login, query)
            .then((matchs: Match[]) => {
                return matchs.map((match: Match) => new MatchOutputDto(match));
            })
            .catch((error: Error) => {
                throw new InternalServerErrorException(error.message);
            });
    }
}
