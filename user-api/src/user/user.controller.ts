import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Put,
    Param,
    Delete,
    Query,
    HttpCode,
    NotFoundException,
    UseGuards,
    UseInterceptors,
    InternalServerErrorException,
    ForbiddenException
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from 'user-api/dto/update-user.dto';
import { QueryFilterDto } from 'validation/query.dto';
import { User } from 'db-interface/Core';
import { UserOutputDto } from 'user-api/dto/user-output.dto';
import { Identity } from './user.decorator';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoggingInterceptor } from 'src/auth/auth.interceptor';
import { Logger } from '@nestjs/common'

@Controller('api/users')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class UserController {
    constructor(private readonly userService: UserService) { }
    private logger: Logger = new Logger('UserController');

    @Get()
    async findAll(@Query() query: QueryFilterDto): Promise<UserOutputDto[]> {
        return this.userService
            .list(query)
            .then((users: User[]) =>
                users.map((value: User) => new UserOutputDto(value)),
            )
            .catch((error: Error) => {
                throw new InternalServerErrorException(error.message);
            });
    }

    @Post()
    async create(@Identity() user: Identity): Promise<UserOutputDto> {
        const found: User | undefined = await this.userService.findOne(user.login);
        if (!found) {
            return await this.userService
                .create(user.login, user.image_url)
                .then((value: User) => {
                    return new UserOutputDto(value);
                })
                .catch((error: Error) => {
                    throw new InternalServerErrorException(error.message);
                });
        }
        return new UserOutputDto(found);
    }

    @Get('me')
    async userMe(@Identity() user: Identity): Promise<UserOutputDto> {
        const found: User | undefined = await this.userService.findOne(user.login);
        if (!found) {
            throw new NotFoundException(`user ${user.login} not found`);
        }
        return new UserOutputDto(found);
    }

    @Patch('me')
    async update(
        @Body() updateUserDto: UpdateUserDto,
        @Identity() user: Identity,
    ): Promise<UserOutputDto> {
        const found: User | undefined = await this.userService.findOne(user.login);

        if (!found) {
            throw new NotFoundException(`user ${user.login} not found`);
        }

		if(updateUserDto.username)
		{
			const namesakedUser: User = await this.userService.findOneByUsername(updateUserDto.username);
			if (namesakedUser && namesakedUser.id != found.id)
				throw new ForbiddenException(`${namesakedUser.login} and ${found.login} could not have the same username`);
		}

        return this.userService
            .updateOne(found, updateUserDto)
            .then((value: User) => new UserOutputDto(value));
    }

    // @Delete('me')
    // @HttpCode(204)
    // async remove(@Identity() user: Identity): Promise<void> {
    //     const result: DeleteResult = await this.userService.removeByLogin(
    //         user.login,
    //     );
    //     if (!result.affected || (result.affected && result.affected == 0)) {
    //         throw new NotFoundException(`user ${user.login} not found`);
    //     }
    // }

    @Get(':login')
    async findOne(@Param('login') login: string): Promise<UserOutputDto> {
        const user: User | undefined = await this.userService.findOne(login);
        if (user) {
            return new UserOutputDto(user);
        }
        throw new NotFoundException(`user ${login} not found`);
    }

    @Get('me/friends')
    async findFriends(
        @Identity() user: Identity,
        @Query() query: QueryFilterDto,
    ): Promise<UserOutputDto[]> {
        const users: User[] = await this.userService.findFriends(user.login, query);
        return users.map((user: User) => new UserOutputDto(user));
    }

    @Put('me/friends/:login')
    // @HttpCode(204)
    async addMeFriends(
        @Identity() user: Identity,
        @Param('login') login: string,
    ): Promise<UserOutputDto> {

        if (user.login == login) {
            throw new ForbiddenException(`User can't be friend with himself`);
        }

        const userOne: User | undefined = await this.userService.findOne(
            user.login,
        );
        const userTwo: User | undefined = await this.userService.findOne(login);

        if (!userOne) {
            throw new NotFoundException(`user ${user.login} not found`);
        }
        if (!userTwo) {
            throw new NotFoundException(`user ${login} not found`);
        }

        const friends = await this.userService.findFriends(user.login, { search: login });
        if (friends.length)
            throw new ForbiddenException(`${login} and ${user.login} are already friends`);

        await this.userService.addFriends(user.login, login).catch((error: Error) => {
            throw new InternalServerErrorException(error.message);
        });
        return new UserOutputDto(userTwo);
    }

    @Delete('me/friends/:login')
    @HttpCode(204)
    async removeMeFriends(
        @Identity() user: Identity,
        @Param('login') login: string,
    ): Promise<void> {

        if (user.login == login) {
            throw new ForbiddenException(`User can't be friend with himself`);
        }

        const userOne: User | undefined = await this.userService.findOne(
            user.login,
        );
        const userTwo: User | undefined = await this.userService.findOne(login);

        if (!userOne) {
            throw new NotFoundException(`user ${user.login} not found`);
        }
        if (!userTwo) {
            throw new NotFoundException(`user ${login} not found`);
        }

        const friends = await this.userService.findFriends(user.login, { search: login });
        if (!friends.length)
            throw new ForbiddenException(`${login} and ${user.login} are not friends`);

        this.userService.removeFriends(user.login, login).catch((error: Error) => {
            throw new InternalServerErrorException(error.message);
        });
    }


    // ------BLOCKED_USERS UTILITARIES---------------------------


    @Get('me/blockeds')
    async findBlockeds(
        @Identity() user: Identity,
        // @Query() query: QueryFilterDto,
    ): Promise<UserOutputDto[]> {
        const users: User[] = await this.userService.findBlockeds(user.login);
        return users.map((user: User) => new UserOutputDto(user));
    }

    @Put('me/blockeds/:login')
    // @HttpCode(204)
    async addMeBlockeds(
        @Identity() user: Identity,
        @Param('login') login: string,
    ): Promise<UserOutputDto> {

        if (user.login == login) { throw new ForbiddenException(`User can't block himself`); }
        const userOne: User | undefined = await this.userService.findOne(user.login,);
        if (!userOne) { throw new NotFoundException(`user ${user.login} not found`); }
        const userTwo: User | undefined = await this.userService.findOne(login);
        if (!userTwo) { throw new NotFoundException(`user ${login} not found`); }

        const blockeds = await this.userService.findBlockedsByLogin(user.login, login);
        if (blockeds.length)
            throw new ForbiddenException(`${login} is already blocked by ${user.login}`);

        this.userService.addBlockeds(user.login, login).catch((error: Error) => {
            throw new InternalServerErrorException(error.message);
        });

        return new UserOutputDto(userTwo);
    }

    @Delete('me/blockeds/:login')
    @HttpCode(204)
    async removeMeBlockeds(
        @Identity() user: Identity,
        @Param('login') login: string,
    ): Promise<void> {

        if (user.login == login) { throw new ForbiddenException(`User can't block himself`); }
        const userOne: User | undefined = await this.userService.findOne(user.login,);
        if (!userOne) { throw new NotFoundException(`user ${user.login} not found`); }
        const userTwo: User | undefined = await this.userService.findOne(login);
        if (!userTwo) { throw new NotFoundException(`user ${login} not found`); }

        const friends = await this.userService.findBlockedsByLogin(user.login, login);
        if (!friends.length)
            throw new ForbiddenException(`${login} and ${user.login} are not blockeds`);

        this.userService.removeBlockeds(user.login, login).catch((error: Error) => {
            throw new InternalServerErrorException(error.message);
        });
    }
}
